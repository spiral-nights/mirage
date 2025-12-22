/**
 * Mirage Engine - Feed Routes
 *
 * Handles /api/v1/feed endpoints for reading and posting notes.
 */

import type { Filter, Event } from 'nostr-tools';
import type { RelayPool } from '../relay-pool';
import type { FeedNote, UnsignedNostrEvent } from '../../types';

export interface FeedRouteContext {
    pool: RelayPool;
    requestSign: (event: UnsignedNostrEvent) => Promise<Event>;
}

/**
 * GET /api/v1/feed - Fetch recent notes
 */
export async function getFeed(
    ctx: FeedRouteContext,
    params?: { limit?: number; authors?: string[] }
): Promise<{ status: number; body: FeedNote[] }> {
    const limit = params?.limit ?? 50;

    const filter: Filter = {
        kinds: [1], // Kind 1 = text note
        limit,
    };

    if (params?.authors) {
        filter.authors = params.authors;
    }

    return new Promise((resolve) => {
        const notes: FeedNote[] = [];
        let resolved = false;

        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                unsubscribe();
                resolve({ status: 200, body: notes });
            }
        }, 5000);

        const unsubscribe = ctx.pool.subscribe(
            [filter],
            (event: Event) => {
                notes.push({
                    id: event.id,
                    pubkey: event.pubkey,
                    content: event.content,
                    createdAt: event.created_at,
                    tags: event.tags,
                });
            },
            () => {
                // EOSE - End of stored events
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    unsubscribe();
                    resolve({ status: 200, body: notes });
                }
            }
        );
    });
}

/**
 * POST /api/v1/feed - Post a new note
 */
export async function postFeed(
    ctx: FeedRouteContext,
    body: { content: string; tags?: string[][] }
): Promise<{ status: number; body: { id: string; success: boolean } }> {
    const unsignedEvent: UnsignedNostrEvent = {
        kind: 1,
        content: body.content,
        tags: body.tags ?? [],
        created_at: Math.floor(Date.now() / 1000),
    };

    try {
        const signedEvent = await ctx.requestSign(unsignedEvent);
        await ctx.pool.publish(signedEvent);

        return {
            status: 201,
            body: { id: signedEvent.id, success: true },
        };
    } catch (error) {
        return {
            status: 500,
            body: { id: '', success: false },
        };
    }
}
