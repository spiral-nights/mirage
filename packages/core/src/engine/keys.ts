/**
 * Space Key Persistence (NIP-78)
 *
 * Manages the "private keychain" for space keys.
 * Keys are stored in a Kind 30078 event with d-tag: "mirage:space_keys".
 * The content is encrypted (NIP-44 self-encryption) by the storage layer.
 */

import type { SpaceKey } from "../types";
import type { StorageRouteContext } from "./routes/storage";
import { internalGetStorage, internalPutStorage } from "./routes/storage";

const KEY_STORAGE_ID = "mirage:space_keys";
const KEYCHAIN_ORIGIN = "mirage";

interface KeyMap {
  [spaceId: string]: SpaceKey;
}

/**
 * Load all space keys from NIP-78 storage.
 * Returns a Map of ScopedSpaceId -> SpaceKey.
 */
export async function loadSpaceKeys(
  ctx: StorageRouteContext,
): Promise<Map<string, SpaceKey>> {
  try {
    // Use a fixed origin for the keychain itself, so it's shared across all apps
    const mirageCtx = { ...ctx, appOrigin: KEYCHAIN_ORIGIN };
    const rawMap = await internalGetStorage<KeyMap>(mirageCtx, KEY_STORAGE_ID);

    if (!rawMap) {
      return new Map();
    }

    const map = new Map<string, SpaceKey>();
    for (const [id, keyInfo] of Object.entries(rawMap)) {
      map.set(id, keyInfo);
    }
    return map;
  } catch (error) {
    console.error("[Keys] Failed to load keys:", error);
    return new Map();
  }
}

/**
 * Save all space keys to NIP-78 storage.
 */
export async function saveSpaceKeys(
  ctx: StorageRouteContext,
  keys: Map<string, SpaceKey>,
): Promise<void> {
  try {
    const rawMap: KeyMap = {};
    for (const [id, keyInfo] of keys.entries()) {
      rawMap[id] = keyInfo;
    }

    // Use a fixed origin for the keychain itself
    const mirageCtx = { ...ctx, appOrigin: KEYCHAIN_ORIGIN };
    await internalPutStorage(mirageCtx, KEY_STORAGE_ID, rawMap);
    console.log("[Keys] Saved keys to NIP-78 (global keychain)");
  } catch (error) {
    console.error("[Keys] Failed to save keys:", error);
    throw error;
  }
}
