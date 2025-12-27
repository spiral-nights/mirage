/**
 * Mirage Engine - User Routes
 *
 * Handles /api/v1/user endpoints for user profile data.
 */

import type { Filter, Event } from 'nostr-tools';
import type { RelayPool } from '../relay-pool';
import type { UserProfile } from '../../types';

export interface UserRouteContext {
    pool: RelayPool;
    currentPubkey: string | null;
}

/**
 * GET /api/v1/user/me - Get current user's profile
 */
export async function getCurrentUser(
    ctx: UserRouteContext
): Promise<{ status: number; body: UserProfile | { error: string } }> {
    if (!ctx.currentPubkey) {
        return { status: 401, body: { error: 'Not authenticated' } };
    }

    return getUserByPubkey(ctx, ctx.currentPubkey);
}

/**
 * GET /api/v1/users/:pubkey - Get a user's profile by pubkey
 */
export async function getUserByPubkey(
    ctx: UserRouteContext,
    pubkey: string
): Promise<{ status: number; body: UserProfile | { error: string } }> {
    const filter: Filter = {
        kinds: [0], // Kind 0 = metadata
        authors: [pubkey],
        limit: 1,
    };

    const event = await ctx.pool.query([filter], 3000);

    if (!event) {
        return { status: 404, body: { error: 'User not found' } };
    }

    try {
        const metadata = JSON.parse(event.content);
        const profile: UserProfile = {
            pubkey: event.pubkey,
            name: metadata.name,
            displayName: metadata.display_name || metadata.displayName,
            about: metadata.about,
            picture: metadata.picture,
            nip05: metadata.nip05,
            lud16: metadata.lud16,
        };
        return { status: 200, body: profile };
    } catch {
        return { status: 500, body: { error: 'Invalid metadata format' } };
    }
}
