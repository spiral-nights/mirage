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

async function getKeys(ctx: SpaceRouteContext): Promise<Map<string, SpaceKey>> {
    if (!keyCache) {
        keyCache = await loadSpaceKeys(ctx);
    }
    return keyCache;
}

function resolveSpaceId(ctx: SpaceRouteContext, spaceId: string): string {
    if (spaceId === 'current') {
        return ctx.currentSpace?.id || 'default';
    }
    return spaceId;
}

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * GET /mirage/v1/space
 * Get current space context
 */
export async function getSpaceContext(
    ctx: SpaceRouteContext
): Promise<{ status: number; body: unknown }> {
    if (ctx.currentSpace) {
        return { status: 200, body: ctx.currentSpace };
    }
    return { status: 200, body: { id: null, standalone: true } };
}

/**
 * GET /mirage/v1/spaces
 * List spaces this app has keys for (filtered by current appOrigin)
 */
export async function listSpaces(
    ctx: SpaceRouteContext
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    // Sync invites on list
    await syncInvites(ctx);

    const keys = await getKeys(ctx);

    const spaces: Space[] = [];
    const appPrefix = `${ctx.appOrigin}:`;

    for (const [scopedId, keyInfo] of keys.entries()) {
        if (keyInfo.deleted) continue; // Skip deleted spaces

        if (scopedId.startsWith(appPrefix)) {
            const id = scopedId.slice(appPrefix.length);
            spaces.push({
                id,
                name: keyInfo.name || `Space ${id.slice(0, 8)}`,
                createdAt: keyInfo.createdAt || 0,
                memberCount: 0,
                appOrigin: ctx.appOrigin,
            });
        }
    }

    return { status: 200, body: spaces };
}

/**
 * GET /mirage/v1/spaces/all
 * List ALL spaces across all apps (for library/management UI)
 */
export async function listAllSpaces(
    ctx: SpaceRouteContext
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const keys = await getKeys(ctx);

    const spaces: Space[] = [];

    for (const [scopedId, keyInfo] of keys.entries()) {
        if (keyInfo.deleted) continue; // Skip deleted spaces

        // Parse scopedId format: "appOrigin:spaceId"
        const colonIndex = scopedId.lastIndexOf(':');
        if (colonIndex === -1) continue;

        const appOrigin = scopedId.slice(0, colonIndex);
        const id = scopedId.slice(colonIndex + 1);

        spaces.push({
            id,
            name: keyInfo.name || `Space ${id.slice(0, 8)}`,
            createdAt: keyInfo.createdAt || 0,
            memberCount: 0,
            appOrigin,
        });
    }

    return { status: 200, body: spaces };
}

/**
 * POST /mirage/v1/spaces
 * Create a new encrypted space
 */
export async function createSpace(
    ctx: SpaceRouteContext,
    body: { name: string; appOrigin?: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body?.name) return { status: 400, body: { error: 'Space name required' } };

    const targetOrigin = body.appOrigin || ctx.appOrigin;

    // 1. Generate ID and Key
    const spaceId = generateRandomId();
    const key = generateSymmetricKey(); // Base64
    const scopedId = `${targetOrigin}:${spaceId}`;
    const createdAt = Math.floor(Date.now() / 1000);

    // 2. Save to NIP-78 (Owner's Keychain) - including name for persistence
    const keys = await getKeys(ctx);
    keys.set(scopedId, {
        key,
        version: 1,
        name: body.name,  // Store the name!
        createdAt,
        deleted: false, // Ensure not deleted
    });
    await saveSpaceKeys(ctx, keys);

    // 3. Return the space object
    const space: Space = {
        id: spaceId,
        name: body.name,
        createdAt,
        memberCount: 1,
        appOrigin: targetOrigin,
    };

    return { status: 201, body: space };
}

/**
 * DELETE /mirage/v1/spaces/:id
 * Delete a space (removes key from storage, messages remain on relays)
 */
export async function deleteSpace(
    ctx: SpaceRouteContext,
    rawSpaceId: string
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const spaceId = resolveSpaceId(ctx, rawSpaceId);
    const keys = await getKeys(ctx);

    // 1. Try directly with current appOrigin (fast path)
    let targetScopedId = `${ctx.appOrigin}:${spaceId}`;

    // 2. Fallback: Search for any scopedId ending with :spaceId
    // This allows the Home/Library UI (mirage-app) to delete spaces created by other apps
    if (!keys.has(targetScopedId)) {
        const found = Array.from(keys.keys()).find(k => k.endsWith(`:${spaceId}`));
        if (found) {
            targetScopedId = found;
        } else {
            return { status: 404, body: { error: 'Space not found' } };
        }
    }

    // Soft delete: mark as deleted instead of removing
    const existing = keys.get(targetScopedId)!;
    keys.set(targetScopedId, { 
        ...existing, 
        deleted: true,
        deletedAt: Math.floor(Date.now() / 1000)
    });
    await saveSpaceKeys(ctx, keys);

    return { status: 200, body: { deleted: spaceId } };
}

/**
 * GET /mirage/v1/spaces/:id/messages
 * Get and decrypt messages
 */
export async function getSpaceMessages(
    ctx: SpaceRouteContext,
    rawSpaceId: string,
    params: { since?: number; limit?: number }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const spaceId = resolveSpaceId(ctx, rawSpaceId);
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

    // 2. Fetch messages
    const events = await ctx.pool.queryAll([filter], 3000);

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
    rawSpaceId: string,
    body: { content: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body?.content) return { status: 400, body: { error: 'Content required' } };

    const spaceId = resolveSpaceId(ctx, rawSpaceId);
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
    rawSpaceId: string,
    body: { pubkey: string; name?: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body?.pubkey) return { status: 400, body: { error: 'Pubkey required' } };

    const spaceId = resolveSpaceId(ctx, rawSpaceId);
    let receiverPubkey = body.pubkey;
    
    console.log(`[InviteDebug] engine.inviteMember: spaceId=${spaceId} targetPubkey=${receiverPubkey.slice(0, 10)}...`);

    if (receiverPubkey.startsWith('npub')) {
        try {
            const decoded = nip19.decode(receiverPubkey);
            if (decoded.type === 'npub') {
                receiverPubkey = decoded.data;
                console.log(`[InviteDebug] Decoded npub to hex: ${receiverPubkey}`);
            }
        } catch (e) {
            console.error(`[InviteDebug] Invalid npub provided: ${receiverPubkey}`);
            return { status: 400, body: { error: 'Invalid npub format' } };
        }
    }

    const scopedId = `${ctx.appOrigin}:${spaceId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) {
        console.error(`[InviteDebug] Space key not found for scopedId: ${scopedId}`);
        return { status: 404, body: { error: 'Space key not found' } };
    }

    // 1. Create Invite Payload
    const invitePayload = {
        type: 'mirage_invite',
        spaceId,
        scopedId,
        key: keyInfo.key,
        version: keyInfo.version,
        name: body.name || keyInfo.name || `Space ${spaceId.slice(0, 8)}`, // Use provided name, or key name, or fallback
        origin: ctx.appOrigin
    };

    console.log(`[InviteDebug] Created invite payload for space: ${keyInfo.name || spaceId}`);

    // 2. Create Inner Rumor (Kind 13)
    const innerEvent: UnsignedNostrEvent = {
        kind: 13,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify(invitePayload),
        pubkey: ctx.currentPubkey
    };

    // 3. Sign Inner Event
    console.log(`[InviteDebug] Requesting signature for inner rumor (Kind 13)`);
    const signedInner = await ctx.requestSign(innerEvent);
    console.log(`[InviteDebug] Signature received for rumor: ${signedInner.id?.slice(0, 8)}`);

    // 4. Wrap (Kind 1059)
    console.log(`[InviteDebug] Wrapping rumor for recipient: ${receiverPubkey.slice(0, 10)}...`);
    const wrapper = wrapEvent(signedInner, receiverPubkey);

    // 5. Publish
    console.log(`[InviteDebug] Publishing Gift Wrap (Kind 1059) to relays...`);
    const publishResult = await ctx.pool.publish(wrapper as any);
    console.log(`[InviteDebug] Publish complete. Result:`, publishResult);

    return { status: 200, body: { invited: receiverPubkey } };
}

/**
 * Sync Invites (Check for Kind 1059 DMs)
 */
export async function syncInvites(ctx: SpaceRouteContext): Promise<void> {
    if (!ctx.currentPubkey) return;

    // 1. Fetch recent Gift Wraps
    // We look back 7 days to ensure we catch invites even if the user hasn't logged in for a while
    // or if the backdating + delay pushes it beyond 48h.
    const filter: Filter = {
        kinds: [1059],
        '#p': [ctx.currentPubkey],
        limit: 100, // Increase limit further
        since: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60)
    };

    console.log(`[InviteDebug] engine.syncInvites: polling for Gift Wraps (Kind 1059) since ${filter.since}`);
    const events = await ctx.pool.queryAll([filter], 3000);
    console.log(`[InviteDebug] engine.syncInvites: found ${events.length} candidate Gift Wraps`);

    const keys = await getKeys(ctx);
    let updated = false;
    const newSpaces: { id: string; name?: string }[] = [];

    // 2. Try to decrypt each
    for (const wrap of events) {
        try {
            console.log(`[InviteDebug] Attempting to decrypt Gift Wrap from ${wrap.pubkey.slice(0, 10)}...`);
            const innerJson = await ctx.requestDecrypt(wrap.pubkey, wrap.content);
            console.log(`[InviteDebug] Decryption success, parsing inner rumor...`);
            const innerEvent = JSON.parse(innerJson) as UnsignedNostrEvent;

            if (innerEvent.kind === 13) {
                const payload = JSON.parse(innerEvent.content);
                console.log(`[InviteDebug] Found Kind 13 rumor, type: ${payload.type}`);
                
                // Check for 'mirage_invite' and correct payload fields
                if (payload.type === 'mirage_invite' && payload.key && payload.scopedId) {
                    const existing = keys.get(payload.scopedId);
                    
                    // Logic:
                    // 1. New space: Add it
                    // 2. Existing space (active): Update if newer version
                    // 3. Existing space (deleted): Revive if invite is NEWER than deletion timestamp
                    
                    const isNewerInvite = existing?.deleted && innerEvent.created_at > (existing.deletedAt || 0);
                    
                    if (!existing || 
                        (!existing.deleted && existing.version < payload.version) ||
                        isNewerInvite
                    ) {
                        console.log(`[InviteDebug] Valid invite discovered for space: ${payload.name || payload.scopedId}`);
                        if (isNewerInvite) {
                            console.log(`[InviteDebug] Reviving deleted space because invite is newer (${innerEvent.created_at} > ${existing?.deletedAt})`);
                        }
                        
                        keys.set(payload.scopedId, {
                            key: payload.key,
                            version: payload.version,
                            name: payload.name, // Save name
                            deleted: false, // Ensure active
                            deletedAt: undefined 
                        });
                        updated = true;
                        
                        // Parse spaceId from scopedId
                        const parts = payload.scopedId.split(':');
                        if (parts.length > 1) {
                            newSpaces.push({ id: parts[1], name: payload.name });
                        }
                    } else if (existing.deleted) {
                        console.log(`[InviteDebug] Ignoring old invite for deleted space: ${payload.scopedId}`);
                    } else {
                        console.log(`[InviteDebug] Already have this space (or newer version): ${payload.scopedId}`);
                    }
                }
            } else {
                console.log(`[InviteDebug] Gift Wrap contained unexpected kind: ${innerEvent.kind}`);
            }
        } catch (e) {
            console.warn(`[InviteDebug] Failed to unwrap/parse Gift Wrap:`, e);
            continue;
        }
    }

    if (updated) {
        console.log(`[InviteDebug] Saving updated keychain with ${newSpaces.length} new spaces`);
        await saveSpaceKeys(ctx, keys);
        
        // Emit notifications
        for (const space of newSpaces) {
            console.log(`[InviteDebug] Emitting NEW_SPACE_INVITE notification for: ${space.name || space.id}`);
            self.postMessage({
                type: 'NEW_SPACE_INVITE',
                id: crypto.randomUUID(),
                spaceId: space.id,
                spaceName: space.name
            });
        }
    } else if (events.length > 0) {
        console.log(`[InviteDebug] No new invites found in the ${events.length} wraps processed.`);
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
    rawSpaceId: string
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const spaceId = resolveSpaceId(ctx, rawSpaceId);
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

    const events = await ctx.pool.queryAll([filter], 3000);


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
    rawSpaceId: string,
    key: string,
    value: unknown
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const spaceId = resolveSpaceId(ctx, rawSpaceId);
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
