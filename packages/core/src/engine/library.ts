/**
 * App Library Persistence (NIP-78)
 * 
 * Manages the user's collection of installed and authored apps.
 */

import { AppDefinition } from '../types';
import { nip19 } from 'nostr-tools';
import { StorageRouteContext, internalGetStorage, internalPutStorage } from './routes/storage';

const APP_LIST_ID = 'app_list';

/**
 * Load the user's app collection from NIP-78.
 */
export async function loadAppLibrary(ctx: StorageRouteContext): Promise<AppDefinition[]> {
    console.log('[Library] Loading app library...');

    // Discovery Load:
    try {
        const list = await internalGetStorage<AppDefinition[]>(ctx, APP_LIST_ID);

        // Self-Healing: If list is empty/missing, rebuild it from raw app events
        if (!list || list.length === 0) {
            console.log('[Library] App list empty, scanning for orphaned apps...');
            const events = await ctx.pool.queryAll([{
                kinds: [30078],
                authors: [ctx.currentPubkey!],
                limit: 100 // Cap to prevent massive loads
            }], 3000);

            const recoveredApps: AppDefinition[] = [];
            const seenNaddrs = new Set<string>();

            for (const ev of events) {
                const dTag = ev.tags.find(t => t[0] === 'd')?.[1];
                // Check if this is an app definition (mirage:app:UUID)
                if (dTag && dTag.startsWith('mirage:app:')) {
                    // Generate naddr
                    const naddr = nip19.naddrEncode({
                        identifier: dTag,
                        pubkey: ev.pubkey,
                        kind: 30078,
                        relays: ctx.pool.getRelays() // Use current relays as hint
                    });

                    if (seenNaddrs.has(naddr)) continue;
                    seenNaddrs.add(naddr);

                    // Try to get name from tags or content
                    let name = ev.tags.find(t => t[0] === 'name')?.[1];
                    if (!name) {
                        // Fallback: try parsing content title if possible, or use ID
                        name = `Recovered App ${dTag.split(':').pop()?.slice(0, 8)}`;
                    }

                    recoveredApps.push({
                        naddr,
                        name,
                        createdAt: ev.created_at * 1000
                    });
                }
            }

            if (recoveredApps.length > 0) {
                console.log(`[Library] Recovered ${recoveredApps.length} apps. Saving to index...`);
                // Save back to index to fix the issue permanently
                try {
                    await internalPutStorage(ctx, APP_LIST_ID, recoveredApps);
                } catch (e) {
                    console.warn('[Library] Failed to save recovered index:', e);
                }
                return recoveredApps;
            }
        }

        console.log('[Library] Loaded apps from NIP-78:', list?.length ?? 0, 'apps');
        return list || [];
    } catch (error) {
        console.error('[Library] Failed to load apps:', error);
        return [];
    }
}

/**
 * Save the user's app collection to NIP-78.
 */
export async function saveAppLibrary(
    ctx: StorageRouteContext,
    apps: AppDefinition[]
): Promise<void> {
    console.log('[Library] Saving app library...', apps.length, 'apps');
    console.log('[Library_DEBUG] Saving Context:', {
        appOrigin: ctx.appOrigin,
        APP_LIST_ID
    });
    try {
        await internalPutStorage(ctx, APP_LIST_ID, apps);
        console.log('[Library] Saved app list to NIP-78');
    } catch (error) {
        console.error('[Library] Failed to save apps:', error);
        throw error;
    }
}

/**
 * Add an app to the library and sync to relays.
 */
export async function addAppToLibrary(
    ctx: StorageRouteContext,
    app: AppDefinition
): Promise<void> {
    console.log('[Library] Adding app to library:', app.name, app.naddr?.slice(0, 20) + '...');
    const library = await loadAppLibrary(ctx);

    let newIdentifier: string | undefined;
    let newPubkey: string | undefined;

    try {
        const decoded = nip19.decode(app.naddr);
        if (decoded.type === 'naddr') {
            newIdentifier = decoded.data.identifier;
            newPubkey = decoded.data.pubkey;
        }
    } catch (e) {
        console.warn('[Library] Failed to decode new app naddr:', e);
    }

    // Deduplicate by d-tag/pubkey if available, otherwise fallback to naddr string equality
    const filtered = library.filter(existing => {
        if (existing.naddr === app.naddr) return false; // Exact string match

        if (newIdentifier && newPubkey) {
            try {
                const decoded = nip19.decode(existing.naddr);
                if (decoded.type === 'naddr') {
                    // If same d-tag AND same author, it's the same app (updated version)
                    if (decoded.data.identifier === newIdentifier && decoded.data.pubkey === newPubkey) {
                        return false;
                    }
                }
            } catch (e) {
                // If existing is invalid, keep it (or maybe remove it? safer to keep for now)
            }
        }
        return true;
    });

    const updated = [app, ...filtered];

    console.log('[Library] Library size: before=', library.length, ', after=', updated.length);
    await saveAppLibrary(ctx, updated);
}

/**
 * Remove an app from the library and sync to relays.
 */
export async function removeAppFromLibrary(
    ctx: StorageRouteContext,
    naddr: string
): Promise<boolean> {
    console.log('[Library] Removing app from library:', naddr?.slice(0, 20) + '...');
    const library = await loadAppLibrary(ctx);

    const filtered = library.filter(a => a.naddr !== naddr);

    if (filtered.length === library.length) {
        console.log('[Library] App not found in library');
        return false; // Not found
    }

    console.log('[Library] Library size: before=', library.length, ', after=', filtered.length);
    await saveAppLibrary(ctx, filtered);
    return true;
}
