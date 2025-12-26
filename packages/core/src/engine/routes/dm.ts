/**
 * Direct Message Routes (NIP-17)
 * 
 * Implements 1-to-1 secure chat using Gift Wraps.
 * Privacy-first: No metadata leaks, sealed sender identity.
 */

import { type Event, type Filter, nip19 } from 'nostr-tools';
import type { UnsignedNostrEvent } from '../../types';
import { StorageRouteContext } from './storage';
import { wrapEvent, unwrapEvent } from '../nip17';

// Reuse Storage Context for pool/signer access
export type DMRouteContext = StorageRouteContext;

interface DMConversation {
    pubkey: string;
    lastMessage: string;
    timestamp: number;
    unreadCount: number;
}

interface DMMessage {
    id: string;
    pubkey: string; // The other person (sender for incoming, receiver for outgoing)
    sender: string; // The actual sender's pubkey
    content: string;
    createdAt: number;
    isIncoming: boolean;
}

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * GET /mirage/v1/dms
 * List all conversations (unique people we've chatted with)
 */
export async function listDMs(
    ctx: DMRouteContext
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    // 1. Fetch recent Gift Wraps (Kind 1059) addressed to US
    const filter: Filter = {
        kinds: [1059],
        '#p': [ctx.currentPubkey],
        limit: 100
    };

    const events: Event[] = [];
    const unsubscribe = ctx.pool.subscribe(
        [filter],
        (e) => events.push(e),
        () => { }
    );

    await new Promise(r => setTimeout(r, 1500));
    unsubscribe();

    // 2. Unwrap and Aggregate
    const conversations = new Map<string, DMConversation>();
    const seenIds = new Set<string>();

    for (const wrap of events) {
        try {
            // LAYER 1: Unwrap Gift (1059) -> Seal (13)
            const sealEvent = await unwrapEvent(wrap, ctx.requestDecrypt);
            // If unwrapEvent fails, it logs warning and returns null.
            if (!sealEvent || sealEvent.kind !== 13) continue;

            // LAYER 2: Decrypt Seal (13) -> Rumor (14)
            if (!sealEvent.pubkey) continue;
            const senderPubkey = sealEvent.pubkey as string;

            let rumorJson: string;
            try {
                rumorJson = await ctx.requestDecrypt(senderPubkey, sealEvent.content);
            } catch (err) {
                console.warn(`[DM] Failed to decrypt Seal from ${senderPubkey.slice(0, 8)}`);
                continue;
            }

            const rumor = JSON.parse(rumorJson) as UnsignedNostrEvent;
            if (!rumor.pubkey) continue;

            // Deduplicate
            const uniqueId = (rumor as any).id || `${rumor.pubkey}:${rumor.created_at}:${rumor.content.slice(0, 20)}`;
            if (seenIds.has(uniqueId)) continue;
            seenIds.add(uniqueId);

            // Determine Conversation Party
            const sender = rumor.pubkey;
            let otherPubkey = sender;

            if (sender === ctx.currentPubkey!) {
                // Outgoing message
                const pTag = rumor.tags.find(t => t[0] === 'p');
                if (pTag && pTag[1]) {
                    otherPubkey = pTag[1];
                }
            }

            const existing = conversations.get(otherPubkey);
            const ts = rumor.created_at;

            if (!existing || ts > existing.timestamp) {
                conversations.set(otherPubkey, {
                    pubkey: otherPubkey,
                    lastMessage: rumor.content,
                    timestamp: ts,
                    unreadCount: 0
                });
            }

        } catch (e) {
            continue;
        }
    }

    const start = Array.from(conversations.values()).sort((a, b) => b.timestamp - a.timestamp);
    return { status: 200, body: start };
}

/**
 * GET /mirage/v1/dms/:pubkey
 * Get message history with a specific person
 */
export async function getDMMessages(
    ctx: DMRouteContext,
    targetPubkey: string,
    params: { limit?: number }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    // Normalize targetPubkey
    let hexTarget = targetPubkey;
    if (hexTarget.startsWith('npub')) {
        try {
            const d = nip19.decode(hexTarget);
            if (d.type === 'npub') hexTarget = d.data as string;
        } catch { }
    }

    const filter: Filter = {
        kinds: [1059],
        '#p': [ctx.currentPubkey],
        limit: params.limit || 50
    };

    const events: Event[] = [];
    const unsubscribe = ctx.pool.subscribe(
        [filter],
        (e) => events.push(e),
        () => { }
    );

    await new Promise(r => setTimeout(r, 1500));
    unsubscribe();

    const messages: DMMessage[] = [];
    const seenIds = new Set<string>();

    for (const wrap of events) {
        try {
            // LAYER 1: Unwrap Gift -> Seal
            const sealEvent = await unwrapEvent(wrap, ctx.requestDecrypt);
            if (!sealEvent || sealEvent.kind !== 13) continue;

            // LAYER 2: Decrypt Seal -> Rumor
            if (!sealEvent.pubkey) continue;
            const senderPubkey = sealEvent.pubkey as string;

            let rumorJson: string;
            try {
                rumorJson = await ctx.requestDecrypt(senderPubkey, sealEvent.content);
            } catch (decErr) {
                continue;
            }

            const rumor = JSON.parse(rumorJson) as UnsignedNostrEvent;
            if (!rumor.pubkey) continue;

            const uniqueId = (rumor as any).id || `${rumor.pubkey}:${rumor.created_at}:${rumor.content}`;
            if (seenIds.has(uniqueId)) continue;
            seenIds.add(uniqueId);

            const sender = rumor.pubkey;
            let isMatch = false;
            let isIncoming = false;

            if (sender === hexTarget) {
                // Incoming from target
                isMatch = true;
                isIncoming = true;
            } else if (sender === ctx.currentPubkey) {
                // Outgoing from me
                const pTag = rumor.tags.find(t => t[0] === 'p');
                if (pTag && pTag[1] === hexTarget) {
                    isMatch = true;
                    isIncoming = false;
                }
            }

            if (isMatch) {
                messages.push({
                    id: (rumor as any).id || 'unsigned',
                    pubkey: hexTarget,
                    sender: sender as string,
                    content: rumor.content,
                    createdAt: rumor.created_at,
                    isIncoming
                });
            }

        } catch (e) { continue; }
    }

    messages.sort((a, b) => a.createdAt - b.createdAt);
    return { status: 200, body: messages };
}

/**
 * POST /mirage/v1/dms/:pubkey
 * Send a Direct Message
 */
export async function sendDM(
    ctx: DMRouteContext,
    targetPubkey: string,
    body: { content: string }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body?.content) return { status: 400, body: { error: 'Content required' } };

    // Normalize Pubkey
    let hexTarget = targetPubkey;
    if (hexTarget.startsWith('npub')) {
        try {
            const d = nip19.decode(hexTarget);
            if (d.type === 'npub') hexTarget = d.data as string;
        } catch {
            return { status: 400, body: { error: 'Invalid pubkey' } };
        }
    }

    // 1. Create Rumor (Kind 14)
    const rumor: UnsignedNostrEvent = {
        kind: 14,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', hexTarget]],
        content: body.content,
        pubkey: ctx.currentPubkey
    };
    const rumorJson = JSON.stringify(rumor);

    // --------------------------------------------------------------------------
    // Path A: Send to Recipient
    // --------------------------------------------------------------------------

    // 2a. Encrypt Rumor for Recipient (NIP-44)
    const cipherTextForRecipient = await ctx.requestEncrypt(hexTarget, rumorJson);

    // 3a. Create Seal (Kind 13)
    const sealForRecipient: UnsignedNostrEvent = {
        kind: 13,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: cipherTextForRecipient,
        pubkey: ctx.currentPubkey
    };
    const signedSealForRecipient = await ctx.requestSign(sealForRecipient);

    // 4a. Wrap Gift for Recipient (Kind 1059)
    const giftForRecipient = wrapEvent(signedSealForRecipient, hexTarget);

    await ctx.pool.publish(giftForRecipient);

    // --------------------------------------------------------------------------
    // Path B: Send to Self (History)
    // --------------------------------------------------------------------------

    if (hexTarget !== ctx.currentPubkey) {
        // NIP-59 Self-Wrap
        // We encrypt the rumor using OUR key for OURSELVES.
        const cipherTextForSelf = await ctx.requestEncrypt(ctx.currentPubkey, rumorJson);

        const sealForSelf: UnsignedNostrEvent = {
            kind: 13,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: cipherTextForSelf,
            pubkey: ctx.currentPubkey
        };
        const signedSealForSelf = await ctx.requestSign(sealForSelf);

        const giftForSelf = wrapEvent(signedSealForSelf, ctx.currentPubkey);

        await ctx.pool.publish(giftForSelf);
    }

    return {
        status: 201,
        body: {
            sent: true,
            to: hexTarget,
            content: body.content
        }
    };
}
