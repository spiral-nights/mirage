/**
 * Storage Routes - NIP-78 Application-Specific Data
 *
 * Provides key-value storage using Kind 30078 replaceable events.
 * Keys are scoped per app using the `d` tag.
 */

import type { Event, Filter } from 'nostr-tools';
import type { RelayPool } from '../relay-pool';
import type { UnsignedNostrEvent } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface StorageRouteContext {
    pool: RelayPool;
    requestSign: (event: UnsignedNostrEvent) => Promise<Event>;
    currentPubkey: string | null;
    appOrigin: string;
}

interface StorageValue {
    key: string;
    value: unknown;
    updatedAt: number;
}

// ============================================================================
// Handlers
// ============================================================================

/**
 * GET /mirage/v1/storage/:key
 * Fetch a stored value by key
 */
export async function getStorage(
    ctx: StorageRouteContext,
    key: string
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    const dTag = `${ctx.appOrigin}:${key}`;

    const filter: Filter = {
        kinds: [30078],
        authors: [ctx.currentPubkey],
        '#d': [dTag],
        limit: 1,
    };

    try {
        // Subscribe and collect events
        const events: Event[] = [];
        const unsubscribe = ctx.pool.subscribe(
            [filter],
            (event) => events.push(event),
            () => { } // onEose
        );

        // Wait for responses (with timeout)
        await new Promise((resolve) => setTimeout(resolve, 3000));
        unsubscribe();

        if (events.length === 0) {
            return { status: 404, body: { error: 'Key not found' } };
        }

        const event = events[0];
        let value: unknown;

        try {
            value = JSON.parse(event.content);
        } catch {
            value = event.content;
        }

        const response: StorageValue = {
            key,
            value,
            updatedAt: event.created_at,
        };

        return { status: 200, body: response };
    } catch (error) {
        console.error('[Storage] Error fetching:', error);
        return { status: 500, body: { error: 'Failed to fetch storage' } };
    }
}

/**
 * PUT /mirage/v1/storage/:key
 * Store or update a value
 */
export async function putStorage(
    ctx: StorageRouteContext,
    key: string,
    body: unknown
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    const dTag = `${ctx.appOrigin}:${key}`;
    const content = typeof body === 'string' ? body : JSON.stringify(body);

    const unsignedEvent: UnsignedNostrEvent = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['d', dTag]],
        content,
    };

    try {
        const signedEvent = await ctx.requestSign(unsignedEvent);
        await ctx.pool.publish(signedEvent);

        const response: StorageValue = {
            key,
            value: body,
            updatedAt: signedEvent.created_at,
        };

        return { status: 200, body: response };
    } catch (error) {
        console.error('[Storage] Error storing:', error);
        return { status: 500, body: { error: 'Failed to store value' } };
    }
}

/**
 * DELETE /mirage/v1/storage/:key
 * Delete a stored value by publishing an empty event with the same d tag
 */
export async function deleteStorage(
    ctx: StorageRouteContext,
    key: string
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    const dTag = `${ctx.appOrigin}:${key}`;

    // Publish an empty event to effectively "delete" the value
    // In Nostr, you can't truly delete, but replacing with empty content
    // signals deletion to clients
    const unsignedEvent: UnsignedNostrEvent = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['d', dTag], ['deleted', 'true']],
        content: '',
    };

    try {
        const signedEvent = await ctx.requestSign(unsignedEvent);
        await ctx.pool.publish(signedEvent);

        return { status: 200, body: { deleted: true, key } };
    } catch (error) {
        console.error('[Storage] Error deleting:', error);
        return { status: 500, body: { error: 'Failed to delete value' } };
    }
}
