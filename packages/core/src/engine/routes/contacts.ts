/**
 * Contact List Routes (NIP-02)
 * 
 * Manage social graph (Kind 3).
 */

import { type Event, type Filter, nip19 } from 'nostr-tools';
import type { UnsignedNostrEvent } from '../../types';
import { StorageRouteContext } from './storage';

export type ContactsRouteContext = StorageRouteContext;

export interface Contact {
    pubkey: string;
    relay?: string;
    petname?: string;
}

// ============================================================================
// Helpers
// ============================================================================

function normalizePubkey(pubkey: string): string {
    if (pubkey.startsWith('npub')) {
        try {
            const d = nip19.decode(pubkey);
            if (d.type === 'npub') return d.data as string;
        } catch { }
    }
    return pubkey;
}

async function fetchContactList(ctx: ContactsRouteContext, pubkey: string): Promise<Contact[]> {
    const filter: Filter = {
        kinds: [3],
        authors: [pubkey],
        limit: 1
    };

    const event = await ctx.pool.query([filter], 3000);

    if (!event) return [];
    const latest = event;

    return latest.tags
        .filter(t => t[0] === 'p')
        .map(t => ({
            pubkey: t[1],
            relay: t[2] || undefined,
            petname: t[3] || undefined
        }));
}

// ============================================================================
// Route Handlers
// ============================================================================

/**
 * GET /mirage/v1/contacts
 * Get my contact list
 */
export async function listContacts(
    ctx: ContactsRouteContext
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };

    const contacts = await fetchContactList(ctx, ctx.currentPubkey);
    return { status: 200, body: contacts };
}

/**
 * GET /mirage/v1/contacts/:pubkey
 * Get another user's contact list
 */
export async function getUserContacts(
    ctx: ContactsRouteContext,
    targetPubkey: string
): Promise<{ status: number; body: unknown }> {
    const hexPubkey = normalizePubkey(targetPubkey);
    const contacts = await fetchContactList(ctx, hexPubkey);
    return { status: 200, body: contacts };
}

/**
 * PUT /mirage/v1/contacts
 * Replace my contact list
 */
export async function updateContacts(
    ctx: ContactsRouteContext,
    body: { contacts: Contact[] }
): Promise<{ status: number; body: unknown }> {
    if (!ctx.currentPubkey) return { status: 401, body: { error: 'Not authenticated' } };
    if (!body || !Array.isArray(body.contacts)) {
        return { status: 400, body: { error: 'Invalid body, expected { contacts: [] }' } };
    }

    const tags = body.contacts.map(c => {
        const tag = ['p', normalizePubkey(c.pubkey)];
        if (c.relay) tag.push(c.relay);
        if (c.petname) {
            if (!c.relay) tag.push(''); // Fill empty relay if petname exists
            tag.push(c.petname);
        }
        return tag;
    });

    const event: UnsignedNostrEvent = {
        kind: 3,
        created_at: Math.floor(Date.now() / 1000),
        tags: tags,
        content: '', // Kind 3 content is usually empty but can contain relay list JSON (NIP-65 uses 10002 now)
        pubkey: ctx.currentPubkey
    };

    const signed = await ctx.requestSign(event);
    await ctx.pool.publish(signed);

    return { status: 200, body: { success: true } };
}
