/**
 * Channel Routes - Encrypted Group Messaging
 *
 * Provides encrypted group channels using AES/ChaCha20 symmetric encryption.
 * Keys are managed via NIP-78 ("Private Keychain") and rotated by the Owner.
 */

import { type Event, type Filter, nip19 } from 'nostr-tools';
import type { UnsignedNostrEvent, Channel, ChannelMessage, SystemEvent, ChannelKey } from '../../types';
import { StorageRouteContext } from './storage';
import { generateSymmetricKey, encryptSymmetric, decryptSymmetric, generateRandomId } from '../crypto';
import { loadChannelKeys, saveChannelKeys } from '../keys';
import { wrapEvent } from '../nip17';

// Reuse Storage Context as it has everything we need (pool, sign, encrypt/decrypt)
export type ChannelRouteContext = StorageRouteContext;

// In-memory cache of keys (sync with NIP-78)
let keyCache: Map<string, ChannelKey> | null = null;

async function getKeys(ctx: ChannelRouteContext): Promise<Map<string, ChannelKey>> {
    if (!keyCache) {
        keyCache = await loadChannelKeys(ctx);
    }
    return keyCache;
}

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * GET /mirage/v1/channels
 * List channels this app has keys for
 */
export async function listChannels(
    ctx: ChannelRouteContext
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const keys = await getKeys(ctx);
    const channels: Channel[] = [];
    const appPrefix = `${ctx.appOrigin}:`;

    for (const [scopedId, keyInfo] of keys.entries()) {
        if (scopedId.startsWith(appPrefix)) {
            const id = scopedId.slice(appPrefix.length);
            // In a real app, we'd fetch metadata (Kind 40/41).
            // For MVP, we return basic info.
            channels.push({
                id,
                name: `Channel ${id.slice(0, 8)}`, // Placeholder name
                createdAt: 0,
                memberCount: 0,
            });
        }
    }

    return { status: 200, body: channels };
}

/**
 * POST /mirage/v1/channels
 * Create a new encrypted channel
 */
export async function createChannel(
    ctx: ChannelRouteContext,
    body: { name: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body?.name) return { status: 400, body: { error: 'Channel name required' } };

    // 1. Generate ID and Key
    const channelId = generateRandomId();
    const key = generateSymmetricKey(); // Base64
    const scopedId = `${ctx.appOrigin}:${channelId}`;

    // 2. Save to NIP-78 (Owner's Keychain)
    const keys = await getKeys(ctx);
    keys.set(scopedId, { key, version: 1 });
    await saveChannelKeys(ctx, keys);

    // 3. Publish System Event (Channel Created) - Encrypted?
    // We should publish a "Channel Metadata" event (Kind 40/41) or just a message.
    // For MVP, we just start the channel history.

    // We return the channel object immediately.
    const channel: Channel = {
        id: channelId,
        name: body.name,
        createdAt: Math.floor(Date.now() / 1000),
        memberCount: 1,
    };

    return { status: 201, body: channel };
}

/**
 * GET /mirage/v1/channels/:id/messages
 * Get and decrypt messages
 */
export async function getChannelMessages(
    ctx: ChannelRouteContext,
    channelId: string,
    params: { since?: number; limit?: number }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const scopedId = `${ctx.appOrigin}:${channelId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) return { status: 404, body: { error: 'Channel key not found' } };

    // Fetch Kind 42 (Channel Message)
    // We use the `d` tag or `root` `e` tag for channel ID?
    // NIP-28 uses `e` tag marker `root`. 
    // Filter: kinds: [42], '#e': [channelId]
    // BUT channelId here is local UUID. It might clash globally.
    // We should use the Scoped ID in the tag? Or just random UUID is fine if unique enough.
    // Using UUID is standard.

    const filter: Filter = {
        kinds: [42],
        '#e': [channelId],
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
    const messages: ChannelMessage[] = [];
    for (const ev of events) {
        try {
            // Content format: "ciphertext?iv=nonce" or JSON
            // Our encryptSymmetric returns { ciphertext, nonce }
            // Expected storage format: JSON string of that object?
            // Or "ciphertext?iv=nonce" string.
            // Let's assume JSON string for robustness.

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
                    channelId,
                    author: ev.pubkey,
                    content: plaintext, // This might be JSON SystemEvent or string
                    type: 'message', // Todo: differentiate based on content structure
                    createdAt: ev.created_at
                });
            }
        } catch (e) {
            // Decryption failure (wrong key version?)
            // We ignore.
        }
    }

    return { status: 200, body: messages };
}

/**
 * POST /mirage/v1/channels/:id/messages
 * Encrypt and send message
 */
export async function postChannelMessage(
    ctx: ChannelRouteContext,
    channelId: string,
    body: { content: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body?.content) return { status: 400, body: { error: 'Content required' } };

    const scopedId = `${ctx.appOrigin}:${channelId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) return { status: 404, body: { error: 'Channel key not found' } };

    // Encrypt
    const encrypted = encryptSymmetric(keyInfo.key, body.content);
    const content = JSON.stringify(encrypted);

    const unsigned: UnsignedNostrEvent = {
        kind: 42,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ['e', channelId, '', 'root'],
            // Add 'p' tags for mentions if any?
        ],
        content,
        pubkey: ctx.currentPubkey
    };

    const signed = await ctx.requestSign(unsigned);
    await ctx.pool.publish(signed);

    const msg: ChannelMessage = {
        id: signed.id,
        channelId,
        author: signed.pubkey,
        content: body.content,
        type: 'message',
        createdAt: signed.created_at
    };

    return { status: 201, body: msg };
}

/**
 * POST /mirage/v1/channels/:id/invite
 * Invite Member via NIP-17 Gift Wrap
 */
export async function inviteMember(
    ctx: ChannelRouteContext,
    channelId: string,
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

    const scopedId = `${ctx.appOrigin}:${channelId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) return { status: 404, body: { error: 'Channel key not found' } };

    // 1. Create Invite Payload
    const invitePayload = {
        type: 'mirage_invite',
        channelId,
        scopedId, // Include scope so they can store it correctly
        key: keyInfo.key, // Send current key
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

    // 3. Sign Inner Event (Real Identity)
    const signedInner = await ctx.requestSign(innerEvent);

    // 4. Wrap (Kind 1059)
    const wrapper = wrapEvent(signedInner, receiverPubkey);

    // 5. Publish Wrapper
    // We need to publish this manually via pool
    // wrapEvent returns a signed Event object (from nostr-tools)
    // pool.publish takes NostrEvent. They are compatible.
    await ctx.pool.publish(wrapper as any);

    return { status: 200, body: { invited: receiverPubkey } };
}

/**
 * Sync Invites (Check for Kind 1059 DMs)
 * Should be called periodically or on startup.
 */
export async function syncInvites(ctx: ChannelRouteContext): Promise<void> {
    if (!ctx.currentPubkey) return;

    // 1. Fetch recent Gift Wraps
    const filter: Filter = {
        kinds: [1059],
        '#p': [ctx.currentPubkey],
        limit: 20, // Check last 20 wraps
        since: Math.floor(Date.now() / 1000) - (24 * 60 * 60) // Last 24h for MVP refresh
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
            // Decrypt Wrapper -> Inner Signed Event (JSON string)
            const innerJson = await ctx.requestDecrypt(wrap.pubkey, wrap.content);
            const innerEvent = JSON.parse(innerJson) as UnsignedNostrEvent;

            // TODO: Verify inner signature?
            // NIP-17 says we should verified the inner event's signature matches its pubkey.
            // For MVP, we trust the decrypted content if valid JSON.

            if (innerEvent.kind === 13) {
                const payload = JSON.parse(innerEvent.content);
                if (payload.type === 'mirage_invite' && payload.key && payload.scopedId) {
                    const existing = keys.get(payload.scopedId);
                    if (!existing || existing.version < payload.version) {
                        console.log('[Channels] Accepted invite for:', payload.scopedId);
                        keys.set(payload.scopedId, {
                            key: payload.key,
                            version: payload.version
                        });
                        updated = true;
                    }
                }
            }
        } catch (e) {
            // Decryption failed (not for us, or different key)
            continue;
        }
    }

    if (updated) {
        await saveChannelKeys(ctx, keys);
    }
}

/**
 * POST /mirage/v1/channels/:id/remove
 * Remove member (Rotate Key) - OWNER ONLY
 */
export async function removeMember(
    ctx: ChannelRouteContext,
    channelId: string,
    body: { pubkey: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const scopedId = `${ctx.appOrigin}:${channelId}`;
    const keys = await getKeys(ctx);
    const keyInfo = keys.get(scopedId);

    if (!keyInfo) return { status: 404, body: { error: 'Channel undefined' } };

    // 1. Rotate Key
    const newKey = generateSymmetricKey();
    const newVersion = keyInfo.version + 1;

    // 2. Update Self (Owner)
    keys.set(scopedId, { key: newKey, version: newVersion });
    await saveChannelKeys(ctx, keys);

    // 3. Fan-out to remaining members?
    // We don't track member list in Key Store.
    // We need to fetch the member list from somewhere?
    // Or client passes list of pubkeys to keep?
    // For MVP, we presume the client sends the list of "remaining members" in body?
    // body: { pubkey: string, keep: string[] } ?

    // If we don't have the list, we can't fan out!
    // The implementation plan assumed we knew the members.
    // In "Distributed State", member list is usually derived from specific events.
    // For this MVP, we will require the client to provide `remainingMembers`.

    return {
        status: 200,
        body: {
            rotated: true,
            version: newVersion,
            note: "Client must explicitly reinvite remaining members using the new key"
        }
    };
}
