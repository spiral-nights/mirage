/**
 * Mirage Engine - Web Worker Entry Point
 *
 * The "Virtual Backend" that handles API requests and manages relay connections.
 */

import type { Event } from 'nostr-tools';
import { RelayPool } from './relay-pool';
import { getFeed, postFeed, type FeedRouteContext } from './routes/feed';
import { getCurrentUser, getUserByPubkey, type UserRouteContext } from './routes/user';
import { getStorage, putStorage, deleteStorage, type StorageRouteContext } from './routes/storage';
import type {
    MirageMessage,
    ApiRequestMessage,
    ApiResponseMessage,
    SignEventMessage,
    RelayConfigMessage,
    UnsignedNostrEvent,
    NostrEvent,
} from '../types';

// ============================================================================
// Utilities
// ============================================================================

// UUID polyfill for Web Workers without crypto.randomUUID
function generateUUID(): string {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback: generate UUID v4 using crypto.getRandomValues
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ============================================================================
// State
// ============================================================================

let pool: RelayPool | null = null;
let poolReadyResolve: () => void;
const poolReady = new Promise<void>((resolve) => {
    poolReadyResolve = resolve;
});
let currentPubkey: string | null = null;
let appOrigin: string = 'mirage-app'; // Default app origin
const pendingSignatures = new Map<
    string,
    { resolve: (event: Event) => void; reject: (error: Error) => void }
>();

// ============================================================================
// Message Handler
// ============================================================================

self.onmessage = async (event: MessageEvent<MirageMessage>) => {
    const message = event.data;

    switch (message.type) {
        case 'RELAY_CONFIG':
            await handleRelayConfig(message);
            break;

        case 'API_REQUEST':
            await handleApiRequest(message);
            break;

        case 'SIGNATURE_RESULT':
            handleSignatureResult(message);
            break;

        case 'SET_PUBKEY':
            currentPubkey = message.pubkey;
            console.log('[Engine] Pubkey set:', currentPubkey?.slice(0, 8) + '...');
            break;

        default:
            console.warn('[Engine] Unknown message type:', message);
    }
};

// ============================================================================
// Relay Configuration
// ============================================================================

async function handleRelayConfig(message: RelayConfigMessage): Promise<void> {
    if (!pool) {
        pool = new RelayPool();
    }

    switch (message.action) {
        case 'SET':
            await pool.setRelays(message.relays);
            break;
        case 'ADD':
            await Promise.allSettled(message.relays.map((url) => pool!.addRelay(url)));
            break;
        case 'REMOVE':
            for (const url of message.relays) {
                pool.removeRelay(url);
            }
            break;
    }

    // Signal that pool is ready for API requests
    poolReadyResolve();
}

// ============================================================================
// API Request Router
// ============================================================================

async function handleApiRequest(message: ApiRequestMessage): Promise<void> {
    // Wait for relay pool to be initialized
    await poolReady;

    if (!pool) {
        sendResponse(message.id, 503, { error: 'Relay pool not initialized' });
        return;
    }

    const { method, path, body } = message;

    try {
        // Route matching
        const route = matchRoute(method, path);

        if (!route) {
            sendResponse(message.id, 404, { error: 'Not found' });
            return;
        }

        const result = await route.handler(body, route.params);
        sendResponse(message.id, result.status, result.body);
    } catch (error) {
        console.error('[Engine] Error handling request:', error);
        sendResponse(message.id, 500, { error: 'Internal server error' });
    }
}

interface RouteMatch {
    handler: (body: unknown, params: Record<string, string>) => Promise<{ status: number; body: unknown }>;
    params: Record<string, string>;
}

function matchRoute(method: string, fullPath: string): RouteMatch | null {
    // Parse path and query string
    const [path, queryString] = fullPath.split('?');
    const params: Record<string, string> = {};

    if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
    }

    const feedCtx: FeedRouteContext = {
        pool: pool!,
        requestSign,
    };

    const userCtx: UserRouteContext = {
        pool: pool!,
        currentPubkey,
    };

    // GET /mirage/v1/ready - Check if engine is initialized
    if (method === 'GET' && path === '/mirage/v1/ready') {
        return {
            handler: async () => ({
                status: 200,
                body: {
                    ready: true,
                    authenticated: !!currentPubkey,
                    relayCount: pool?.getRelays().length ?? 0,
                },
            }),
            params: {},
        };
    }

    // GET /mirage/v1/feed
    if (method === 'GET' && path === '/mirage/v1/feed') {
        return {
            handler: async () => getFeed(feedCtx, { limit: params.limit ? parseInt(params.limit, 10) : undefined }),
            params,
        };
    }

    // POST /mirage/v1/feed
    if (method === 'POST' && path === '/mirage/v1/feed') {
        return {
            handler: async (body) => postFeed(feedCtx, body as { content: string; tags?: string[][] }),
            params: {},
        };
    }

    // GET /mirage/v1/user/me
    if (method === 'GET' && path === '/mirage/v1/user/me') {
        return {
            handler: async () => getCurrentUser(userCtx),
            params: {},
        };
    }

    // GET /mirage/v1/users/:pubkey
    const usersMatch = path.match(/^\/mirage\/v1\/users\/([a-f0-9]{64})$/);
    if (method === 'GET' && usersMatch) {
        return {
            handler: async () => getUserByPubkey(userCtx, usersMatch[1]),
            params: { pubkey: usersMatch[1] },
        };
    }

    // Storage routes - /mirage/v1/storage/:key
    const storageMatch = path.match(/^\/mirage\/v1\/storage\/(.+)$/);
    if (storageMatch) {
        const key = decodeURIComponent(storageMatch[1]);
        const storageCtx: StorageRouteContext = {
            pool: pool!,
            requestSign,
            currentPubkey,
            appOrigin,
        };

        if (method === 'GET') {
            return {
                handler: async () => getStorage(storageCtx, key),
                params: { key },
            };
        }

        if (method === 'PUT') {
            return {
                handler: async (body) => putStorage(storageCtx, key, body),
                params: { key },
            };
        }

        if (method === 'DELETE') {
            return {
                handler: async () => deleteStorage(storageCtx, key),
                params: { key },
            };
        }
    }

    return null;
}

// ============================================================================
// Signing
// ============================================================================

function requestSign(event: UnsignedNostrEvent): Promise<Event> {
    return new Promise((resolve, reject) => {
        const id = generateUUID();

        pendingSignatures.set(id, { resolve, reject });

        const message: SignEventMessage = {
            type: 'ACTION_SIGN_EVENT',
            id,
            event,
        };

        self.postMessage(message);

        // Timeout after 60 seconds
        setTimeout(() => {
            if (pendingSignatures.has(id)) {
                pendingSignatures.delete(id);
                reject(new Error('Signing request timed out'));
            }
        }, 60000);
    });
}

function handleSignatureResult(message: { id: string; signedEvent?: Event; error?: string }): void {
    const pending = pendingSignatures.get(message.id);
    if (!pending) {
        console.warn('[Engine] Received signature for unknown request:', message.id);
        return;
    }

    pendingSignatures.delete(message.id);

    if (message.error) {
        pending.reject(new Error(message.error));
    } else if (message.signedEvent) {
        // Update current pubkey if we don't have it
        if (!currentPubkey && message.signedEvent.pubkey) {
            currentPubkey = message.signedEvent.pubkey;
        }

        pending.resolve(message.signedEvent);
    } else {
        pending.reject(new Error('Invalid signature result'));
    }
}

// ============================================================================
// Response Helper
// ============================================================================

function sendResponse(id: string, status: number, body: unknown): void {
    const response: ApiResponseMessage = {
        type: 'API_RESPONSE',
        id,
        status,
        body,
    };
    self.postMessage(response);
}

// Export for type checking (not actually used in worker)
export type { FeedRouteContext, UserRouteContext };
