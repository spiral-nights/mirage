/**
 * Storage Routes - NIP-78 Application-Specific Data
 *
 * Provides key-value storage using Kind 30078 replaceable events.
 * Keys are scoped per app using the `d` tag.
 * 
 * SECURITY: All content is encrypted using NIP-44 self-encryption
 * to prevent other apps/clients from reading the data.
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
    requestEncrypt: (pubkey: string, plaintext: string) => Promise<string>;
    requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>;
    currentPubkey: string | null;
    appOrigin: string;
}

interface StorageValue {
    key: string;
    value: unknown;
    updatedAt: number;
}

// ============================================================================
// Internal Helpers (Headless)
// ============================================================================

/**
 * Headless fetch and decrypt
 */
export async function internalGetStorage<T = unknown>(
    ctx: StorageRouteContext,
    key: string
): Promise<T | null> {
    if (!ctx.currentPubkey) throw new Error('Not authenticated');

    const dTag = `${ctx.appOrigin}:${key}`;
    const filter: Filter = {
        kinds: [30078],
        authors: [ctx.currentPubkey],
        '#d': [dTag],
        limit: 1,
    };

    const events: Event[] = [];
    const unsubscribe = ctx.pool.subscribe(
        [filter],
        (event) => events.push(event),
        () => { }
    );

    // Wait for response
    await new Promise((resolve) => setTimeout(resolve, 3000));
    unsubscribe();

    if (events.length === 0) return null;

    // Decrypt
    const plaintext = await ctx.requestDecrypt(ctx.currentPubkey, events[0].content);

    // Parse
    try {
        return JSON.parse(plaintext);
    } catch {
        return plaintext as unknown as T;
    }
}

/**
 * Headless encrypt and publish
 */
export async function internalPutStorage<T>(
    ctx: StorageRouteContext,
    key: string,
    value: T
): Promise<Event> {
    if (!ctx.currentPubkey) throw new Error('Not authenticated');

    const dTag = `${ctx.appOrigin}:${key}`;
    const plaintext = typeof value === 'string' ? value : JSON.stringify(value);

    // Encrypt
    const ciphertext = await ctx.requestEncrypt(ctx.currentPubkey, plaintext);

    const unsignedEvent: UnsignedNostrEvent = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['d', dTag]],
        content: ciphertext,
    };

    const signedEvent = await ctx.requestSign(unsignedEvent);
    await ctx.pool.publish(signedEvent);

    return signedEvent;
}

// ============================================================================
// Handlers
// ============================================================================

/**
 * GET /mirage/v1/storage/:key
 */
export async function getStorage(
    ctx: StorageRouteContext,
    key: string
): Promise<{ status: number; body: unknown }> {
    try {
        if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

        const value = await internalGetStorage(ctx, key);

        if (value === null) {
            return { status: 404, body: { error: 'Key not found' } };
        }

        return {
            status: 200,
            body: {
                key,
                value,
                updatedAt: Math.floor(Date.now() / 1000) // Approximate, internalGetStorage doesn't return event yet
            }
        };
    } catch (error) {
        console.error('[Storage] Error:', error);
        return { status: 500, body: { error: error instanceof Error ? error.message : 'Storage error' } };
    }
}

/**
 * PUT /mirage/v1/storage/:key
 */
export async function putStorage(
    ctx: StorageRouteContext,
    key: string,
    body: unknown
): Promise<{ status: number; body: unknown }> {
    try {
        if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

        const event = await internalPutStorage(ctx, key, body);

        return {
            status: 200,
            body: {
                key,
                value: body,
                updatedAt: event.created_at
            }
        };
    } catch (error) {
        console.error('[Storage] Error:', error);
        return { status: 500, body: { error: error instanceof Error ? error.message : 'Storage error' } };
    }
}

/**
 * DELETE /mirage/v1/storage/:key
 */
export async function deleteStorage(
    ctx: StorageRouteContext,
    key: string
): Promise<{ status: number; body: unknown }> {
    // ... keep existing implementation or use internalPutStorage?
    // internalPutStorage can't easily add extra tags ('deleted').
    // Keeping minimal copy for now.

    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    const dTag = `${ctx.appOrigin}:${key}`;

    // Encrypt empty content
    let ciphertext: string;
    try {
        ciphertext = await ctx.requestEncrypt(ctx.currentPubkey, '');
    } catch (err) {
        return { status: 500, body: { error: 'Failed to encrypt deletion marker' } };
    }

    const unsignedEvent: UnsignedNostrEvent = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['d', dTag], ['deleted', 'true']],
        content: ciphertext,
    };

    try {
        const signedEvent = await ctx.requestSign(unsignedEvent);
        await ctx.pool.publish(signedEvent);
        return { status: 200, body: { deleted: true, key } };
    } catch (error) {
        return { status: 500, body: { error: 'Failed to delete value' } };
    }
}
