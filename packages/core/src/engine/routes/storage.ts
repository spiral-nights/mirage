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
import { SYSTEM_APP_ORIGIN } from '../keys';

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
    currentSpace?: { id: string; name: string; owner?: string; members?: string[] };
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

    // System storage (keychain, library) uses 'mirage' origin and doesn't require space
    const isSystemStorage = ctx.appOrigin === SYSTEM_APP_ORIGIN;
    if (!isSystemStorage && !ctx.currentSpace?.id) {
        throw new Error('Space context required for storage operations');
    }

    const author = targetPubkey || ctx.currentPubkey!;
    // App storage is scoped to space, system storage is not
    const dTag = isSystemStorage
        ? `${ctx.appOrigin}:${key}`
        : `${ctx.appOrigin}:${ctx.currentSpace!.id}:${key}`;

    console.log(`[Storage_DEBUG] GET key="${key}"`);
    console.log(`[Storage_DEBUG] Context: origin="${ctx.appOrigin}" space="${ctx.currentSpace?.id}" user="${ctx.currentPubkey}"`);
    console.log(`[Storage_DEBUG] Calculated dTag: "${dTag}"`);

    const filter: Filter = {
        kinds: [30078],
        authors: [author],
        '#d': [dTag],
        limit: 1,
    };

    console.log(`[Storage_DEBUG] Querying Filter:`, JSON.stringify(filter));
    const event = await ctx.pool.query([filter], 3000);

    if (event) {
        console.log(`[Storage_DEBUG] Found Event: id=${event.id} created_at=${event.created_at}`);
    } else {
        console.warn(`[Storage_DEBUG] No event found for dTag="${dTag}"`);
    }

    if (!event) return null;
    const content = event.content;

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
    if (ctx.currentPubkey === author) {
        try {
            console.log(`[Storage_DEBUG] Decrypting content (len=${content.length})...`);
            const plaintext = await ctx.requestDecrypt(ctx.currentPubkey, content);
            console.log(`[Storage_DEBUG] Decrypted successfully (len=${plaintext.length})`);
            try {
                return JSON.parse(plaintext);
            } catch (e) {
                console.warn(`[Storage_DEBUG] Decrypted content is not JSON:`, e);
                return plaintext as unknown as T;
            }
        } catch (e) {
            console.error(`[Storage_DEBUG] Decryption failed:`, e);
            // Decryption failed
        }
    } else {
        console.warn(`[Storage_DEBUG] Skipping decryption: author mismatch (me=${ctx.currentPubkey}, author=${author})`);
    }

    // 3. Return Raw (If public string)
    console.warn(`[Storage_DEBUG] Returning RAW ciphertext for ${key}`);
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

    // System storage (keychain, library) uses 'mirage' origin and doesn't require space
    const isSystemStorage = ctx.appOrigin === SYSTEM_APP_ORIGIN;
    if (!isSystemStorage && !ctx.currentSpace?.id) {
        throw new Error('Space context required for storage operations');
    }

    // App storage is scoped to space, system storage is not
    const dTag = isSystemStorage
        ? `${ctx.appOrigin}:${key}`
        : `${ctx.appOrigin}:${ctx.currentSpace!.id}:${key}`;
    const plaintext = typeof value === 'string' ? value : JSON.stringify(value);

    console.log(`[Storage_DEBUG] PUT key="${key}" public=${isPublic}`);
    console.log(`[Storage_DEBUG] Context: origin="${ctx.appOrigin}" space="${ctx.currentSpace?.id}"`);
    console.log(`[Storage_DEBUG] dTag="${dTag}"`);

    let content = plaintext;
    if (!isPublic) {
        content = await ctx.requestEncrypt(ctx.currentPubkey, plaintext);
    }

    const created_at = Math.floor(Date.now() / 1000);
    // console.log(`[Storage] Creating event with created_at=${created_at}`);

    const unsignedEvent: UnsignedNostrEvent = {
        kind: 30078,
        created_at,
        tags: [['d', dTag]],
        content: content,
    };

    const signedEvent = await ctx.requestSign(unsignedEvent);
    console.log(`[Storage_DEBUG] Signed Event: id=${signedEvent.id} pubkey=${signedEvent.pubkey} kind=${signedEvent.kind}`);

    await ctx.pool.publish(signedEvent);
    console.log(`[Storage_DEBUG] Publish complete for ${signedEvent.id}`);

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

    // System storage (keychain, library) uses 'mirage' origin and doesn't require space
    const isSystemStorage = ctx.appOrigin === SYSTEM_APP_ORIGIN;
    if (!isSystemStorage && !ctx.currentSpace?.id) {
        return { status: 400, body: { error: 'Space context required for storage operations' } };
    }

    // App storage is scoped to space, system storage is not
    const dTag = isSystemStorage
        ? `${ctx.appOrigin}:${key}`
        : `${ctx.appOrigin}:${ctx.currentSpace!.id}:${key}`;

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
        // 1. Overwrite with tombstone (fast update for clients)
        const signedTombstone = await ctx.requestSign(unsignedEvent);
        await ctx.pool.publish(signedTombstone);

        // 2. Send Kind 5 Deletion Request (NIP-09 standard cleanup)
        // This tells relays to actually delete the old versions
        const deletionEvent: UnsignedNostrEvent = {
            kind: 5,
            created_at: Math.floor(Date.now() / 1000) + 5, // Slightly after tombstone
            content: 'Deleted by Mirage',
            tags: [['a', `30078:${ctx.currentPubkey}:${dTag}`]],
        };

        const signedDeletion = await ctx.requestSign(deletionEvent);
        await ctx.pool.publish(signedDeletion);

        return { status: 200, body: { deleted: true, key } };
    } catch (error) {
        console.error('[Storage] Delete failed:', error);
        return { status: 500, body: { error: 'Failed to delete value' } };
    }
}