/**
 * Storage Routes - NIP-78 Application-Specific Data
 *
 * Provides key-value storage using Kind 30078 replaceable events.
 * Keys are scoped per app using the `d` tag.
 * 
 * SECURITY: Data is encrypted (NIP-44) by default.
 * OPTION: 'public=true' skips encryption for shared data.
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

// ============================================================================
// Internal Helpers (Headless)
// ============================================================================

/**
 * Headless fetch and decrypt
 */
export async function internalGetStorage<T = unknown>(
    ctx: StorageRouteContext,
    key: string,
    targetPubkey?: string
): Promise<T | null> {
    if (!ctx.currentPubkey && !targetPubkey) throw new Error('Not authenticated');

    const author = targetPubkey || ctx.currentPubkey!;
    const dTag = `${ctx.appOrigin}:${key}`;

    const filter: Filter = {
        kinds: [30078],
        authors: [author],
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
    const content = events[0].content;

    // 1. Try to parse as JSON (Public Data)
    try {
        const parsed = JSON.parse(content);
        // If it looks like a NIP-44 ciphertext, it might be a false positive string, 
        // but generally generic JSON is public.
        // If the user is the author, we might try to decrypt if it fails to be useful?
        // For simplicity: If it parses as JSON and doesn't look like NIP-44 (base64?iv=...), return it.
        // NIP-44 usually isn't valid JSON.
        return parsed as T;
    } catch {
        // Not JSON. Might be ciphertext or raw string.
    }

    // 2. Try to Decrypt (Private Data)
    // Only possible if we are the author (self-encrypted) OR it was encrypted for us (NIP-04/44/17).
    // Standard Storage is Self-Encrypted.
    if (ctx.currentPubkey === author) {
        try {
            const plaintext = await ctx.requestDecrypt(ctx.currentPubkey, content);
            try {
                return JSON.parse(plaintext);
            } catch {
                return plaintext as unknown as T;
            }
        } catch (e) {
            // Decryption failed
        }
    }

    // 3. Return Raw (If public string)
    return content as unknown as T;
}

/**
 * Headless encrypt and publish
 */
export async function internalPutStorage<T>(
    ctx: StorageRouteContext,
    key: string,
    value: T,
    isPublic: boolean = false
): Promise<Event> {
    if (!ctx.currentPubkey) throw new Error('Not authenticated');

    const dTag = `${ctx.appOrigin}:${key}`;
    const plaintext = typeof value === 'string' ? value : JSON.stringify(value);

    console.log(`[Storage] PUT key="${key}" dTag="${dTag}" public=${isPublic}`);

    let content = plaintext;
    if (!isPublic) {
        content = await ctx.requestEncrypt(ctx.currentPubkey, plaintext);
    }

    const created_at = Math.floor(Date.now() / 1000);
    console.log(`[Storage] Creating event with created_at=${created_at}`);

    const unsignedEvent: UnsignedNostrEvent = {
        kind: 30078,
        created_at,
        tags: [['d', dTag]],
        content: content,
    };

    const signedEvent = await ctx.requestSign(unsignedEvent);
    console.log(`[Storage] Event signed: id=${signedEvent.id?.slice(0, 8)}... pubkey=${signedEvent.pubkey?.slice(0, 8)}...`);

    await ctx.pool.publish(signedEvent);
    console.log(`[Storage] Event published successfully`);

    return signedEvent;
}

// ============================================================================
// Handlers
// ============================================================================

/**
 * GET /mirage/v1/storage/:key
 * Params: pubkey (optional)
 */
export async function getStorage(
    ctx: StorageRouteContext,
    key: string,
    params: { pubkey?: string }
): Promise<{ status: number; body: unknown }> {
    try {
        // We allow anonymous reads if pubkey is provided (Public Storage)
        if (!ctx.currentPubkey && !params.pubkey) return { status: 401, body: { error: 'Not authenticated' } };

        const value = await internalGetStorage(ctx, key, params.pubkey);

        if (value === null) {
            return { status: 404, body: { error: 'Key not found' } };
        }

        return {
            status: 200,
            body: {
                key,
                value,
                updatedAt: Math.floor(Date.now() / 1000)
            }
        };
    } catch (error) {
        console.error('[Storage] Error:', error);
        return { status: 500, body: { error: error instanceof Error ? error.message : 'Storage error' } };
    }
}

/**
 * PUT /mirage/v1/storage/:key
 * Body: value
 * Params: public (optional string "true")
 */
export async function putStorage(
    ctx: StorageRouteContext,
    key: string,
    body: unknown,
    params: { public?: string }
): Promise<{ status: number; body: unknown }> {
    try {
        if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

        const isPublic = params.public === 'true';
        const event = await internalPutStorage(ctx, key, body, isPublic);

        return {
            status: 200,
            body: {
                key,
                value: body,
                updatedAt: event.created_at,
                public: isPublic
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