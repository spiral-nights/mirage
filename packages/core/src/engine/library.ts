/**
 * App Library Persistence (NIP-78)
 * 
 * Manages the user's collection of installed and authored apps.
 */

import { AppDefinition } from '../types';
import { StorageRouteContext, internalGetStorage, internalPutStorage } from './routes/storage';

const APP_LIST_ID = 'mirage:app_list';

/**
 * Load the user's app collection from NIP-78.
 */
export async function loadAppLibrary(ctx: StorageRouteContext): Promise<AppDefinition[]> {
    console.log('[Library] Loading app library...');
    try {
        const list = await internalGetStorage<AppDefinition[]>(ctx, APP_LIST_ID);
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

    // Deduplicate by naddr
    const filtered = library.filter(a => a.naddr !== app.naddr);
    const updated = [app, ...filtered];

    console.log('[Library] Library size: before=', library.length, ', after=', updated.length);
    await saveAppLibrary(ctx, updated);
}
