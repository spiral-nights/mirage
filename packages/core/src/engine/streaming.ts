
/**
 * Mirage Engine - Streaming Handlers
 *
 * Manages real-time subscriptions and event streaming.
 */

import type { Event, SimplePool } from 'nostr-tools';

// ============================================================================
// Types
// ============================================================================

export interface ActiveSubscription {
    id: string;
    unsubscribe: () => void;
    filter: any;
    buffer: Event[];
}

// ============================================================================
// State
// ============================================================================

export const activeSubscriptions = new Map<string, ActiveSubscription>();

// ============================================================================
// Stream Handlers
// ============================================================================

export async function handleStreamOpen(
    message: { type: 'STREAM_OPEN'; id: string; method: string; path: string; headers?: Record<string, string> },
    pool: SimplePool,
    relays: string[],
    currentPubkey: string | null
): Promise<void> {
    const { id, path } = message;

    try {
        // Parse Filter from Path
        let filter: any = null;

        // MATCH: /mirage/v1/channels/:id/messages
        const channelMatch = path.match(/^\/mirage\/v1\/channels\/([a-zA-Z0-9_-]+)\/messages/);
        if (channelMatch) {
            const channelId = channelMatch[1];
            filter = {
                kinds: [42], // Channel Message
                '#e': [channelId],
                limit: 50,
            };
        }

        // MATCH: /mirage/v1/feed
        else if (path === '/mirage/v1/feed') {
            filter = {
                kinds: [1],
                limit: 50,
            };
        }

        // MATCH: /mirage/v1/dm/:pubkey
        else {
            const dmMatch = path.match(/^\/mirage\/v1\/dm\/([a-f0-9]{64})$/);
            if (dmMatch) {
                if (!currentPubkey) {
                    sendStreamError(id, 'Authentication required for DMs');
                    return;
                }
                filter = {
                    kinds: [4],
                    '#p': [currentPubkey],
                    limit: 50,
                };
            }
        }

        if (!filter) {
            sendStreamError(id, 'Stream route not found: ' + path);
            return;
        }

        // Start Subscription
        console.log('[Engine] Starting stream:', id, path, filter);
        const sub = pool.subscribe(relays, filter, {
            onevent: (event: Event) => {
                sendStreamChunk(id, `data: ${JSON.stringify(event)}\n\n`);
            }
        });

        // Track Subscription
        activeSubscriptions.set(id, {
            id,
            unsubscribe: () => sub.close(),
            filter,
            buffer: [],
        });

    } catch (error) {
        console.error('[Engine] Stream error:', error);
        sendStreamError(id, 'Internal stream error');
    }
}

// ============================================================================
// Message Helpers
// ============================================================================

export function sendStreamChunk(id: string, chunk: string): void {
    self.postMessage({
        type: 'STREAM_CHUNK',
        id,
        chunk,
    });
}

export function sendStreamError(id: string, error: string): void {
    self.postMessage({
        type: 'STREAM_ERROR',
        id,
        error,
    });
}
