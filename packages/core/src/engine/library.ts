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

    try {
        console.log(`[Library_DEBUG] Fetching APP_LIST_ID="${APP_LIST_ID}"...`);
        const result = await internalGetStorage<AppDefinition[]>(ctx, APP_LIST_ID);

        let list = Array.isArray(result) ? result : null;
        if (result && !Array.isArray(result)) {
            console.warn('[Library_DEBUG] Fetched data is corrupted (not an array). Triggering self-healing.');
        }

        console.log(`[Library_DEBUG] Fetched list:`, list ? `${list.length} items` : 'NULL');

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
        console.log(`[Library_DEBUG] Writing to key="${APP_LIST_ID}"...`);
        const event = await internalPutStorage(ctx, APP_LIST_ID, apps);
        console.log(`[Library_DEBUG] Saved successfully. D-Tag="${event.tags.find(t => t[0] === 'd')?.[1]}" ID=${event.id?.slice(0, 8)}`);
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

    // 2. Publish deletion request (Kind 5) to relays
    try {
        const decoded = nip19.decode(naddr);
        if (decoded.type === 'naddr') {
            const { identifier } = decoded.data;
            console.log(`[Library] Publishing deletion for d-tag="${identifier}"...`);

            const unsigned = {
                kind: 5,
                pubkey: ctx.currentPubkey!,
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ['e', ''], // Kind 5 usually expects e/a tags, but for addressable we use 'a'
                    ['a', `30078:${ctx.currentPubkey}:${identifier}`]
                ],
                content: 'App deleted by user'
            };

            const signed = await ctx.requestSign(unsigned);
            await ctx.pool.publish(signed);
            console.log('[Library] Deletion request published.');
        }
    } catch (e) {
        console.error('[Library] Failed to publish deletion request:', e);
        // We don't fail the operation if this part fails, as the local delete is more important for UX
    }

    return true;
}
