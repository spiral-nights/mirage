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
// Handlers
// ============================================================================

/**
 * GET /mirage/v1/storage/:key
 * Fetch and decrypt a stored value by key
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

        // Decrypt the content (NIP-44 self-decryption)
        let plaintext: string;
        try {
            plaintext = await ctx.requestDecrypt(ctx.currentPubkey, event.content);
        } catch (err) {
            console.error('[Storage] Decryption failed:', err);
            return { status: 500, body: { error: 'Failed to decrypt storage' } };
        }

        // Parse the decrypted JSON
        let value: unknown;
        try {
            value = JSON.parse(plaintext);
        } catch {
            value = plaintext;
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
 * Encrypt and store a value
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
    const plaintext = typeof body === 'string' ? body : JSON.stringify(body);

    // Encrypt the content (NIP-44 self-encryption)
    let ciphertext: string;
    try {
        ciphertext = await ctx.requestEncrypt(ctx.currentPubkey, plaintext);
    } catch (err) {
        console.error('[Storage] Encryption failed:', err);
        return { status: 500, body: { error: 'Failed to encrypt storage' } };
    }

    const unsignedEvent: UnsignedNostrEvent = {
        kind: 30078,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['d', dTag]],
        content: ciphertext,  // Encrypted content
    };

    try {
        const signedEvent = await ctx.requestSign(unsignedEvent);
        await ctx.pool.publish(signedEvent);

        const response: StorageValue = {
            key,
            value: body,  // Return original value (not encrypted)
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
 * Delete a stored value by publishing an encrypted empty event
 */
export async function deleteStorage(
    ctx: StorageRouteContext,
    key: string
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    const dTag = `${ctx.appOrigin}:${key}`;

    // Encrypt empty content to maintain consistency
    let ciphertext: string;
    try {
        ciphertext = await ctx.requestEncrypt(ctx.currentPubkey, '');
    } catch (err) {
        console.error('[Storage] Encryption failed:', err);
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
        console.error('[Storage] Error deleting:', error);
        return { status: 500, body: { error: 'Failed to delete value' } };
    }
}
