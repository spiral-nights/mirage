/**
 * Channel Routes - Encrypted Group Messaging
 *
 * Provides encrypted group channels using NIP-44 encryption.
 * Channels are scoped per app (like storage).
 */

import type { Event, Filter } from 'nostr-tools';
import type { RelayPool } from '../relay-pool';
import type { UnsignedNostrEvent, Channel, ChannelMessage, SystemEvent } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface ChannelRouteContext {
    pool: RelayPool;
    requestSign: (event: UnsignedNostrEvent) => Promise<Event>;
    currentPubkey: string | null;
    appOrigin: string;
}

// Channel metadata stored locally (in-memory for now, could be persisted)
interface ChannelKey {
    key: string;  // Base64 encoded symmetric key
    version: number;
}

// In-memory channel key store (per app)
const channelKeys = new Map<string, ChannelKey>();

// ============================================================================
// Helpers
// ============================================================================

function getScopedChannelId(appOrigin: string, channelId: string): string {
    return `${appOrigin}:${channelId}`;
}

function generateChannelId(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

async function generateSymmetricKey(): Promise<string> {
    const key = new Uint8Array(32);
    crypto.getRandomValues(key);
    // Convert to base64
    return btoa(String.fromCharCode(...key));
}

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * GET /mirage/v1/channels
 * List channels this app has access to
 */
export async function listChannels(
    ctx: ChannelRouteContext
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    // Return channels we have keys for (scoped to this app)
    const channels: Channel[] = [];
    const appPrefix = `${ctx.appOrigin}:`;

    for (const [scopedId, keyInfo] of channelKeys.entries()) {
        if (scopedId.startsWith(appPrefix)) {
            channels.push({
                id: scopedId.slice(appPrefix.length),
                name: scopedId.slice(appPrefix.length), // TODO: Store name
                createdAt: 0, // TODO: Store createdAt
                memberCount: 0, // TODO: Track members
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
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    if (!body?.name) {
        return { status: 400, body: { error: 'Channel name required' } };
    }

    const channelId = generateChannelId();
    const scopedId = getScopedChannelId(ctx.appOrigin, channelId);
    const key = await generateSymmetricKey();

    // Store channel key
    channelKeys.set(scopedId, { key, version: 1 });

    // Create system message for channel creation
    const systemEvent: SystemEvent = {
        action: 'channel_created',
        name: body.name,
        createdBy: ctx.currentPubkey,
    };

    // TODO: Publish encrypted channel metadata event
    // For now, just return the channel info
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
 * Get messages from a channel (decrypted)
 */
export async function getChannelMessages(
    ctx: ChannelRouteContext,
    channelId: string,
    params: { since?: number; limit?: number }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    const scopedId = getScopedChannelId(ctx.appOrigin, channelId);
    const keyInfo = channelKeys.get(scopedId);

    if (!keyInfo) {
        return { status: 404, body: { error: 'Channel not found or not a member' } };
    }

    // TODO: Query for encrypted channel messages, decrypt, and return
    // For now, return empty array
    const messages: ChannelMessage[] = [];

    return { status: 200, body: messages };
}

/**
 * POST /mirage/v1/channels/:id/messages
 * Send a message to a channel
 */
export async function postChannelMessage(
    ctx: ChannelRouteContext,
    channelId: string,
    body: { content: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    if (!body?.content) {
        return { status: 400, body: { error: 'Message content required' } };
    }

    const scopedId = getScopedChannelId(ctx.appOrigin, channelId);
    const keyInfo = channelKeys.get(scopedId);

    if (!keyInfo) {
        return { status: 404, body: { error: 'Channel not found or not a member' } };
    }

    // TODO: Encrypt message with channel key and publish
    // For now, return success placeholder
    const message: ChannelMessage = {
        id: crypto.randomUUID(),
        channelId,
        author: ctx.currentPubkey,
        content: body.content,
        type: 'message',
        createdAt: Math.floor(Date.now() / 1000),
    };

    return { status: 201, body: message };
}

/**
 * POST /mirage/v1/channels/:id/invite
 * Invite a user to the channel (DM them the current key)
 */
export async function inviteMember(
    ctx: ChannelRouteContext,
    channelId: string,
    body: { pubkey: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    if (!body?.pubkey) {
        return { status: 400, body: { error: 'Member pubkey required' } };
    }

    const scopedId = getScopedChannelId(ctx.appOrigin, channelId);
    const keyInfo = channelKeys.get(scopedId);

    if (!keyInfo) {
        return { status: 404, body: { error: 'Channel not found or not a member' } };
    }

    // TODO: Send NIP-17 DM to invitee with channel key
    // TODO: Publish system message about member joining

    return { status: 200, body: { invited: body.pubkey } };
}

/**
 * POST /mirage/v1/channels/:id/remove
 * Remove a user from the channel (rotate key, notify remaining)
 */
export async function removeMember(
    ctx: ChannelRouteContext,
    channelId: string,
    body: { pubkey: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    if (!body?.pubkey) {
        return { status: 400, body: { error: 'Member pubkey required' } };
    }

    const scopedId = getScopedChannelId(ctx.appOrigin, channelId);
    const keyInfo = channelKeys.get(scopedId);

    if (!keyInfo) {
        return { status: 404, body: { error: 'Channel not found' } };
    }

    // Rotate key
    const newKey = await generateSymmetricKey();
    channelKeys.set(scopedId, { key: newKey, version: keyInfo.version + 1 });

    // TODO: DM new key to remaining members
    // TODO: Publish system message about member removal and key rotation

    const systemEvent: SystemEvent = {
        action: 'member_removed',
        pubkey: body.pubkey,
        removedBy: ctx.currentPubkey,
    };

    return { status: 200, body: { removed: body.pubkey, keyVersion: keyInfo.version + 1 } };
}

/**
 * POST /mirage/v1/channels/:id/leave
 * Leave a channel voluntarily
 */
export async function leaveChannel(
    ctx: ChannelRouteContext,
    channelId: string
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    const scopedId = getScopedChannelId(ctx.appOrigin, channelId);

    if (!channelKeys.has(scopedId)) {
        return { status: 404, body: { error: 'Channel not found' } };
    }

    // Remove our key (no rotation needed, we're leaving)
    channelKeys.delete(scopedId);

    // TODO: Publish system message about leaving

    const systemEvent: SystemEvent = {
        action: 'member_left',
        pubkey: ctx.currentPubkey,
    };

    return { status: 200, body: { left: true } };
}
