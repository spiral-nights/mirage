/**
 * Space Routes - Encrypted Shared Workspaces
 *
 * Provides encrypted collaborative spaces using AES/ChaCha20 symmetric encryption.
 * Keys are managed via NIP-78 ("Private Keychain").
 */

import { type Event, type Filter, nip19 } from 'nostr-tools';
import type { UnsignedNostrEvent, Space, SpaceMessage, SystemEvent, SpaceKey } from '../../types';
import { StorageRouteContext } from './storage';
import { generateSymmetricKey, encryptSymmetric, decryptSymmetric, generateRandomId } from '../crypto';
import { loadSpaceKeys, saveSpaceKeys } from '../keys';
import { wrapEvent } from '../nip17';

// Reuse Storage Context as it has everything we need (pool, sign, encrypt/decrypt)
export type SpaceRouteContext = StorageRouteContext;

// In-memory cache of keys (sync with NIP-78)
let keyCache: Map<string, SpaceKey> | null = null;

// In-memory cache for KV Store Snapshots
// Map<scopedSpaceId, { state: Map<string, { value: any; updatedAt: number }>; latestTimestamp: number }>
const storeCache = new Map<string, { state: Map<string, { value: unknown; updatedAt: number }>; latestTimestamp: number }>();

/**
 * Injects a session-only key (e.g. from a shared URL)
 */
export async function setSessionKey(ctx: SpaceRouteContext, spaceId: string, key: string): Promise<void> {
    const keys = await getKeys(ctx);
    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    keys.set(scopedId, { key, version: 1 });
    console.log('[Spaces] Session key injected for:', spaceId);
}

async function getKeys(ctx: SpaceRouteContext): Promise<Map<string, SpaceKey>> {
    if (!keyCache) {
        keyCache = await loadSpaceKeys(ctx);
    }
    return keyCache;
}

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * GET /mirage/v1/spaces
 * List spaces this app has keys for
 */
export async function listSpaces(
    ctx: SpaceRouteContext
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const keys = await getKeys(ctx);
    const spaces: Space[] = [];
    const appPrefix = `${ctx.appOrigin}:`;

    for (const [scopedId, keyInfo] of keys.entries()) {
        if (scopedId.startsWith(appPrefix)) {
            const id = scopedId.slice(appPrefix.length);
            // In a real app, we'd fetch metadata (Kind 40/41).
            // For MVP, we return basic info.
            spaces.push({
                id,
                name: `Space ${id.slice(0, 8)}`, // Placeholder name
                createdAt: 0,
                memberCount: 0,
            });
        }
    }

    return { status: 200, body: spaces };
}

/**
 * POST /mirage/v1/spaces
 * Create a new encrypted space
 */
export async function createSpace(
    ctx: SpaceRouteContext,
    body: { name: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body?.name) return { status: 400, body: { error: 'Space name required' } };

    // 1. Generate ID and Key
    const spaceId = generateRandomId();
    const key = generateSymmetricKey(); // Base64
    const scopedId = `${ctx.appOrigin}:${spaceId}`;

    // 2. Save to NIP-78 (Owner's Keychain)
    const keys = await getKeys(ctx);
    keys.set(scopedId, { key, version: 1 });
    await saveSpaceKeys(ctx, keys);

    // 3. Publish System Event (Space Created)
    // We return the space object immediately.
    const space: Space = {
        id: spaceId,
        name: body.name,
        createdAt: Math.floor(Date.now() / 1000),
        memberCount: 1,
    };

    return { status: 201, body: space };
}

/**
 * GET /mirage/v1/spaces/:id/messages
 * Get and decrypt messages
 */
export async function getSpaceMessages(
    ctx: SpaceRouteContext,
    spaceId: string,
    params: { since?: number; limit?: number }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) return { status: 404, body: { error: 'Space key not found' } };

    const filter: Filter = {
        kinds: [42],
        '#e': [spaceId],
        limit: params.limit || 50,
    };
    if (params.since) filter.since = params.since;

    const events: Event[] = [];
    const unsubscribe = ctx.pool.subscribe(
        [filter],
        (e) => events.push(e),
        () => { }
    );

    await new Promise(r => setTimeout(r, 1500)); // Wait for relays
    unsubscribe();

    // Decrypt
    const messages: SpaceMessage[] = [];
    for (const ev of events) {
        try {
            let payload: { ciphertext: string; nonce: string };
            try {
                payload = JSON.parse(ev.content);
            } catch {
                continue; // Not our format
            }

            const plaintext = decryptSymmetric(keyInfo.key, payload.ciphertext, payload.nonce);
            if (plaintext) {
                messages.push({
                    id: ev.id,
                    spaceId,
                    author: ev.pubkey,
                    content: plaintext,
                    type: 'message',
                    createdAt: ev.created_at
                });
            }
        } catch (e) {
            // Decryption failure
        }
    }

    return { status: 200, body: messages };
}

/**
 * POST /mirage/v1/spaces/:id/messages
 * Encrypt and send message
 */
export async function postSpaceMessage(
    ctx: SpaceRouteContext,
    spaceId: string,
    body: { content: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body?.content) return { status: 400, body: { error: 'Content required' } };

    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) return { status: 404, body: { error: 'Space key not found' } };

    // Encrypt
    const encrypted = encryptSymmetric(keyInfo.key, body.content);
    const content = JSON.stringify(encrypted);

    const unsigned: UnsignedNostrEvent = {
        kind: 42,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ['e', spaceId, '', 'root'],
        ],
        content,
        pubkey: ctx.currentPubkey
    };

    const signed = await ctx.requestSign(unsigned);
    await ctx.pool.publish(signed);

    const msg: SpaceMessage = {
        id: signed.id,
        spaceId,
        author: signed.pubkey,
        content: body.content,
        type: 'message',
        createdAt: signed.created_at
    };

    return { status: 201, body: msg };
}

/**
 * POST /mirage/v1/spaces/:id/invite
 * Invite Member via NIP-17 Gift Wrap
 */
export async function inviteMember(
    ctx: SpaceRouteContext,
    spaceId: string,
    body: { pubkey: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body?.pubkey) return { status: 400, body: { error: 'Pubkey required' } };

    let receiverPubkey = body.pubkey;
    if (receiverPubkey.startsWith('npub')) {
        try {
            const decoded = nip19.decode(receiverPubkey);
            if (decoded.type === 'npub') {
                receiverPubkey = decoded.data;
            }
        } catch (e) {
            return { status: 400, body: { error: 'Invalid npub format' } };
        }
    }

    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) return { status: 404, body: { error: 'Space key not found' } };

    // 1. Create Invite Payload
    const invitePayload = {
        type: 'mirage_invite',
        spaceId,
        scopedId,
        key: keyInfo.key,
        version: keyInfo.version,
        origin: ctx.appOrigin
    };

    // 2. Create Inner Rumor (Kind 13)
    const innerEvent: UnsignedNostrEvent = {
        kind: 13,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(invitePayload),
        pubkey: ctx.currentPubkey
    };

    // 3. Sign Inner Event
    const signedInner = await ctx.requestSign(innerEvent);

    // 4. Wrap (Kind 1059)
    const wrapper = wrapEvent(signedInner, receiverPubkey);

    // 5. Publish
    await ctx.pool.publish(wrapper as any);

    return { status: 200, body: { invited: receiverPubkey } };
}

/**
 * Sync Invites (Check for Kind 1059 DMs)
 */
export async function syncInvites(ctx: SpaceRouteContext): Promise<void> {
    if (!ctx.currentPubkey) return;

    // 1. Fetch recent Gift Wraps
    const filter: Filter = {
        kinds: [1059],
        '#p': [ctx.currentPubkey],
        limit: 20,
        since: Math.floor(Date.now() / 1000) - (24 * 60 * 60)
    };

    const events: Event[] = [];
    const unsubscribe = ctx.pool.subscribe(
        [filter],
        (e) => events.push(e),
        () => { }
    );

    await new Promise(r => setTimeout(r, 2000));
    unsubscribe();

    const keys = await getKeys(ctx);
    let updated = false;

    // 2. Try to decrypt each
    for (const wrap of events) {
        try {
            const innerJson = await ctx.requestDecrypt(wrap.pubkey, wrap.content);
            const innerEvent = JSON.parse(innerJson) as UnsignedNostrEvent;

            if (innerEvent.kind === 13) {
                const payload = JSON.parse(innerEvent.content);
                // Check for 'mirage_invite' and correct payload fields
                if (payload.type === 'mirage_invite' && payload.key && payload.scopedId) {
                    const existing = keys.get(payload.scopedId);
                    if (!existing || existing.version < payload.version) {
                        console.log('[Spaces] Accepted invite for:', payload.scopedId);
                        keys.set(payload.scopedId, {
                            key: payload.key,
                            version: payload.version
                        });
                        updated = true;
                    }
                }
            }
        } catch (e) {
            continue;
        }
    }

    if (updated) {
        await saveSpaceKeys(ctx, keys);
    }
}

// ============================================================================
// Shared KV Store (Virtual Database)
// ============================================================================

/**
 * GET /mirage/v1/spaces/:id/store
 * Returns the current state of the shared database (JSON object).
 */
export async function getSpaceStore(
    ctx: SpaceRouteContext,
    spaceId: string
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) return { status: 404, body: { error: 'Space key not found' } };

    // 1. Load from Memory Cache
    let cache = storeCache.get(scopedId);
    if (!cache) {
        cache = { state: new Map(), latestTimestamp: 0 };
        storeCache.set(scopedId, cache);
    }

    // 2. Fetch Deltas (Since last timestamp)
    const filter: Filter = {
        kinds: [42],
        '#e': [spaceId],
        '#t': ['mirage_store'], // Topic filter
        since: cache.latestTimestamp + 1,
    };

    const events: Event[] = [];
    const unsubscribe = ctx.pool.subscribe(
        [filter],
        (e) => events.push(e),
        () => { }
    );

    await new Promise(r => setTimeout(r, 1500)); // Wait for relays
    unsubscribe();

    // 3. Merge Events (Last-Write-Wins)
    let hasUpdates = false;
    for (const ev of events) {
        // Update watermark
        if (ev.created_at > cache.latestTimestamp) {
            cache.latestTimestamp = ev.created_at;
        }

        try {
            // Decrypt
            let payload: { ciphertext: string; nonce: string };
            try {
                payload = JSON.parse(ev.content);
            } catch {
                continue;
            }

            const plaintext = decryptSymmetric(keyInfo.key, payload.ciphertext, payload.nonce);
            if (!plaintext) continue;

            // Parse: ["store_put", key, value]
            const data = JSON.parse(plaintext);
            if (Array.isArray(data) && data[0] === 'store_put' && data.length === 3) {
                const [_, key, value] = data;
                
                // LWW Check
                const existing = cache.state.get(key);
                if (!existing || ev.created_at >= existing.updatedAt) {
                    cache.state.set(key, { value, updatedAt: ev.created_at });
                    hasUpdates = true;
                }
            }
        } catch (e) {
            // Ignore malformed
        }
    }

    // 4. Return State Object
    const stateObj: Record<string, unknown> = {};
    for (const [key, record] of cache.state.entries()) {
        stateObj[key] = record.value;
    }

    return { status: 200, body: stateObj };
}

/**
 * PUT /mirage/v1/spaces/:id/store/:key
 * Update a single value in the shared database.
 */
export async function updateSpaceStore(
    ctx: SpaceRouteContext,
    spaceId: string,
    key: string,
    value: unknown
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) return { status: 404, body: { error: 'Space key not found' } };

    // 1. Prepare Payload: ["store_put", key, value]
    const rawPayload = JSON.stringify(['store_put', key, value]);

    // 2. Encrypt
    const encrypted = encryptSymmetric(keyInfo.key, rawPayload);
    const content = JSON.stringify(encrypted);

    // 3. Publish Kind 42
    const unsigned: UnsignedNostrEvent = {
        kind: 42,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ['e', spaceId, '', 'root'],
            ['t', 'mirage_store'],
            ['k', key], // Index by key
        ],
        content,
        pubkey: ctx.currentPubkey
    };

    const signed = await ctx.requestSign(unsigned);
    await ctx.pool.publish(signed);

    // Update Local Cache Immediately (Optimistic Update)
    let cache = storeCache.get(scopedId);
    if (!cache) {
        cache = { state: new Map(), latestTimestamp: 0 };
        storeCache.set(scopedId, cache);
    }
    // We update the cache with the new value, assuming success. 
    // Ideally we should wait for confirmation, but for UI responsiveness this is good.
    // We use the event's timestamp.
    cache.state.set(key, { value, updatedAt: signed.created_at });
    if (signed.created_at > cache.latestTimestamp) {
        cache.latestTimestamp = signed.created_at;
    }

    return { status: 200, body: { key, value, updatedAt: signed.created_at } };
}
