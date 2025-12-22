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

    return new Promise((resolve) => {
        let profile: UserProfile | null = null;
        let resolved = false;

        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                unsubscribe();
                if (profile) {
                    resolve({ status: 200, body: profile });
                } else {
                    resolve({ status: 404, body: { error: 'User not found' } });
                }
            }
        }, 3000);

        const unsubscribe = ctx.pool.subscribe(
            [filter],
            (event: Event) => {
                try {
                    const metadata = JSON.parse(event.content);
                    profile = {
                        pubkey: event.pubkey,
                        name: metadata.name,
                        displayName: metadata.display_name || metadata.displayName,
                        about: metadata.about,
                        picture: metadata.picture,
                        nip05: metadata.nip05,
                        lud16: metadata.lud16,
                    };
                } catch {
                    // Invalid JSON in profile, skip
                }
            },
            () => {
                // EOSE
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    unsubscribe();
                    if (profile) {
                        resolve({ status: 200, body: profile });
                    } else {
                        resolve({ status: 404, body: { error: 'User not found' } });
                    }
                }
            }
        );
    });
}
