/**
 * Channel Key Persistence (NIP-78)
 * 
 * Manages the "private keychain" for channel keys.
 * Keys are stored in a Kind 30078 event with d-tag: "mirage:channel_keys".
 * The content is encrypted (NIP-44 self-encryption) by the storage layer.
 */

import type { ChannelKey } from '../../types';
import type { StorageRouteContext } from './routes/storage';
import { internalGetStorage, internalPutStorage } from './routes/storage';

const KEY_STORAGE_ID = 'mirage:channel_keys';

interface KeyMap {
    [channelId: string]: ChannelKey;
}

/**
 * Load all channel keys from NIP-78 storage.
 * Returns a Map of ScopedChannelId -> ChannelKey.
 */
export async function loadChannelKeys(ctx: StorageRouteContext): Promise<Map<string, ChannelKey>> {
    try {
        const rawMap = await internalGetStorage<KeyMap>(ctx, KEY_STORAGE_ID);

        if (!rawMap) {
            return new Map();
        }

        const map = new Map<string, ChannelKey>();
        for (const [id, keyInfo] of Object.entries(rawMap)) {
            map.set(id, keyInfo);
        }
        return map;
    } catch (error) {
        console.error('[Keys] Failed to load keys:', error);
        return new Map();
    }
}

/**
 * Save all channel keys to NIP-78 storage.
 */
export async function saveChannelKeys(
    ctx: StorageRouteContext,
    keys: Map<string, ChannelKey>
): Promise<void> {
    try {
        const rawMap: KeyMap = {};
        for (const [id, keyInfo] of keys.entries()) {
            rawMap[id] = keyInfo;
        }

        await internalPutStorage(ctx, KEY_STORAGE_ID, rawMap);
        console.log('[Keys] Saved keys to NIP-78');
    } catch (error) {
        console.error('[Keys] Failed to save keys:', error);
        throw error;
    }
}
