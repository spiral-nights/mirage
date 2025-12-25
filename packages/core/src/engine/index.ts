/**
 * Mirage Engine - Web Worker Entry Point
 *
 * The "Virtual Backend" that handles API requests and manages relay connections.
 */

import type { Event } from 'nostr-tools';
import { RelayPool } from './relay-pool';

import { getCurrentUser, getUserByPubkey, type UserRouteContext } from './routes/user';
import { getStorage, putStorage, deleteStorage, type StorageRouteContext } from './routes/storage';
import {
    listChannels,
    createChannel,
    getChannelMessages,
    postChannelMessage,
    inviteMember,
    removeMember,
    syncInvites,
    type ChannelRouteContext
} from './routes/channels';
import { getEvents, postEvents, type EventsRouteContext } from './routes/events';
import type {
    MirageMessage,
    ApiRequestMessage,
    ApiResponseMessage,
    RelayConfigMessage,
} from '../types';
import { handleStreamOpen, sendStreamError } from './streaming';
import { requestSign, handleSignatureResult, requestEncrypt, requestDecrypt, handleEncryptResult, handleDecryptResult } from './signing';

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

        case 'ENCRYPT_RESULT':
            handleEncryptResult(message as any);
            break;

        case 'DECRYPT_RESULT':
            handleDecryptResult(message as any);
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
        const route = await matchRoute(method, path);

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
    handler: (body: unknown, params: Record<string, string | string[]>) => Promise<{ status: number; body: unknown }>;
    params: Record<string, string | string[]>;
}

async function matchRoute(method: string, fullPath: string): Promise<RouteMatch | null> {
    const [path, queryString] = fullPath.split('?');
    const params: Record<string, string | string[]> = {};

    if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((value, key) => {
            if (params[key]) {
                if (Array.isArray(params[key])) {
                    (params[key] as string[]).push(value);
                } else {
                    params[key] = [params[key] as string, value];
                }
            } else {
                params[key] = value;
            }
        });
    }

    const eventsCtx: EventsRouteContext = {
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

    // GET /mirage/v1/events (Query events)
    if (method === 'GET' && path === '/mirage/v1/events') {
        return {
            handler: async () => getEvents(eventsCtx, params),
            params,
        };
    }

    // POST /mirage/v1/events (Publish event)
    if (method === 'POST' && path === '/mirage/v1/events') {
        return {
            handler: async (body) => postEvents(eventsCtx, body as { kind: number; content: string; tags?: string[][] }),
            params: {},
        };
    }

    // Legacy /feed support -> redirected to /events?kinds=1
    if (method === 'GET' && path === '/mirage/v1/feed') {
        const feedParams = { ...params, kinds: ['1'] };
        return {
            handler: async () => getEvents(eventsCtx, feedParams),
            params: feedParams,
        };
    }

    // Legacy POST /feed -> redirected to /events with kind 1
    if (method === 'POST' && path === '/mirage/v1/feed') {
        return {
            handler: async (body: any) => postEvents(eventsCtx, { ...body, kind: 1 }),
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

    // GET /mirage/v1/profiles/:pubkey (New Standard)
    const profilesMatch = path.match(/^\/mirage\/v1\/profiles\/([a-f0-9]{64})$/);
    if (method === 'GET' && profilesMatch) {
        return {
            handler: async () => getUserByPubkey(userCtx, profilesMatch[1]),
            params: { pubkey: profilesMatch[1] },
        };
    }

    // GET /mirage/v1/users/:pubkey (Legacy Alias)
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
            requestEncrypt,
            requestDecrypt,
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
        requestEncrypt,
        requestDecrypt,
        currentPubkey,
        appOrigin,
    };

    // GET /mirage/v1/channels
    if (method === 'GET' && path === '/mirage/v1/channels') {
        // Sync invites lazily on list
        await syncInvites(channelCtx);

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
    const channelMatch = path.match(/^\/mirage\/v1\/channels\/([a-zA-Z0-9_-]+)(.*)/);
    if (channelMatch) {
        const channelId = channelMatch[1];
        const subPath = channelMatch[2]; // e.g. "/messages"

        // Use helper for safe parsing since params can be array
        const getIntParam = (p: string | string[] | undefined): number | undefined =>
            p ? parseInt(String(p), 10) : undefined;

        // GET .../messages
        if (method === 'GET' && subPath === '/messages') {
            return {
                handler: async () => getChannelMessages(channelCtx, channelId, {
                    since: getIntParam(params.since),
                    limit: getIntParam(params.limit),
                }),
                params: { channelId },
            };
        }

        // POST .../messages
        if (method === 'POST' && subPath === '/messages') {
            return {
                handler: async (body) => postChannelMessage(channelCtx, channelId, body as { content: string }),
                params: { channelId },
            };
        }

        // POST .../invite
        if (method === 'POST' && subPath === '/invite') {
            return {
                handler: async (body) => inviteMember(channelCtx, channelId, body as { pubkey: string }),
                params: { channelId },
            };
        }

        // POST .../remove
        if (method === 'POST' && subPath === '/remove') {
            return {
                handler: async (body) => removeMember(channelCtx, channelId, body as { pubkey: string }),
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
export type { UserRouteContext };
