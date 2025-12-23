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
import {
    listChannels,
    createChannel,
    getChannelMessages,
    postChannelMessage,
    inviteMember,
    removeMember,
    leaveChannel,
    type ChannelRouteContext
} from './routes/channels';
import type {
    MirageMessage,
    ApiRequestMessage,
    ApiResponseMessage,
    RelayConfigMessage,
} from '../types';
import { handleStreamOpen, sendStreamError } from './streaming';
import { requestSign, handleSignatureResult } from './signing';

// ============================================================================
// State
// ============================================================================

let pool: RelayPool | null = null;
let poolReadyResolve: () => void;
const poolReady = new Promise<void>((resolve) => {
    poolReadyResolve = resolve;
});
let currentPubkey: string | null = null;
let appOrigin: string = 'mirage-app';

function setCurrentPubkey(pubkey: string): void {
    currentPubkey = pubkey;
}

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

        case 'STREAM_OPEN':
            await poolReady;
            if (pool) {
                await handleStreamOpen(message as any, pool, currentPubkey);
            } else {
                sendStreamError((message as any).id, 'Relay pool not initialized');
            }
            break;

        case 'SIGNATURE_RESULT':
            handleSignatureResult(message as any, setCurrentPubkey, currentPubkey);
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

    poolReadyResolve();
}

// ============================================================================
// API Request Router
// ============================================================================

async function handleApiRequest(message: ApiRequestMessage): Promise<void> {
    await poolReady;

    if (!pool) {
        sendResponse(message.id, 503, { error: 'Relay pool not initialized' });
        return;
    }

    const { method, path, body } = message;

    try {
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

// ============================================================================
// Route Matching
// ============================================================================

interface RouteMatch {
    handler: (body: unknown, params: Record<string, string>) => Promise<{ status: number; body: unknown }>;
    params: Record<string, string>;
}

function matchRoute(method: string, fullPath: string): RouteMatch | null {
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

    // GET /mirage/v1/ready
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

    // =========================================================================
    // Channel routes
    // =========================================================================
    const channelCtx: ChannelRouteContext = {
        pool: pool!,
        requestSign,
        currentPubkey,
        appOrigin,
    };

    // GET /mirage/v1/channels
    if (method === 'GET' && path === '/mirage/v1/channels') {
        return {
            handler: async () => listChannels(channelCtx),
            params: {},
        };
    }

    // POST /mirage/v1/channels
    if (method === 'POST' && path === '/mirage/v1/channels') {
        return {
            handler: async (body) => createChannel(channelCtx, body as { name: string }),
            params: {},
        };
    }

    // Channel-specific routes
    const channelMatch = path.match(/^\/mirage\/v1\/channels\/([a-zA-Z0-9_-]+)/);
    if (channelMatch) {
        const channelId = channelMatch[1];

        // GET /mirage/v1/channels/:id/messages
        if (method === 'GET' && path.endsWith('/messages')) {
            return {
                handler: async () => getChannelMessages(channelCtx, channelId, {
                    since: params.since ? parseInt(params.since, 10) : undefined,
                    limit: params.limit ? parseInt(params.limit, 10) : undefined,
                }),
                params: { channelId },
            };
        }

        // POST /mirage/v1/channels/:id/messages
        if (method === 'POST' && path.endsWith('/messages')) {
            return {
                handler: async (body) => postChannelMessage(channelCtx, channelId, body as { content: string }),
                params: { channelId },
            };
        }

        // POST /mirage/v1/channels/:id/invite
        if (method === 'POST' && path.endsWith('/invite')) {
            return {
                handler: async (body) => inviteMember(channelCtx, channelId, body as { pubkey: string }),
                params: { channelId },
            };
        }

        // POST /mirage/v1/channels/:id/remove
        if (method === 'POST' && path.endsWith('/remove')) {
            return {
                handler: async (body) => removeMember(channelCtx, channelId, body as { pubkey: string }),
                params: { channelId },
            };
        }

        // POST /mirage/v1/channels/:id/leave
        if (method === 'POST' && path.endsWith('/leave')) {
            return {
                handler: async () => leaveChannel(channelCtx, channelId),
                params: { channelId },
            };
        }
    }

    return null;
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

// Export for type checking
export type { FeedRouteContext, UserRouteContext };
