import type { SpaceKey, UnsignedNostrEvent } from "../types";
import type { SimplePool, Filter, Event } from "nostr-tools";

// Define a context compatible with services
export interface KeyStorageContext {
  pool: SimplePool;
  relays: string[];
  requestSign: (event: UnsignedNostrEvent) => Promise<Event>;
  requestEncrypt: (pubkey: string, plaintext: string) => Promise<string>;
  requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>;
  currentPubkey: string | null;
  appOrigin: string; // usually 'mirage' for keys
}

/**
 * System app origin - used for:
 * 1. System-level storage (keychain, library) that exists outside of spaces
 * 2. Admin API access validation (/admin/* routes)
 */
export const SYSTEM_APP_ORIGIN = "mirage";

const KEY_STORAGE_ID = "space_keys";

interface KeyMap {
  [spaceId: string]: SpaceKey;
}


/**
 * Load all space keys from NIP-78 storage.
 * Returns a Map of ScopedSpaceId -> SpaceKey.
 */
export async function loadSpaceKeys(
  ctx: KeyStorageContext,
  storageId: string | string[] = KEY_STORAGE_ID
): Promise<Map<string, SpaceKey>> {
  try {
    const rawMap = await internalGetStorage<KeyMap>(ctx, storageId);

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
  ctx: KeyStorageContext,
  keys: Map<string, SpaceKey>,
  storageId: string = KEY_STORAGE_ID
): Promise<void> {
  try {
    const rawMap: KeyMap = {};
    for (const [id, keyInfo] of keys.entries()) {
      rawMap[id] = keyInfo;
    }

    await internalPutStorage(ctx, storageId, rawMap);
    console.log("[Keys] Saved keys to NIP-78 (global keychain)");
  } catch (error) {
    console.error("[Keys] Failed to save keys:", error);
    throw error;
  }
}

/**
 * Internal Helper: Get NIP-78 Data (System Origin 'mirage')
 */
async function internalGetStorage<T>(
  ctx: KeyStorageContext,
  key: string | string[]
): Promise<T | null> {
  if (!ctx.currentPubkey) return null;

  // Force system origin for keys
  const origin = SYSTEM_APP_ORIGIN;
  const keys = Array.isArray(key) ? key : [key];
  const dTags = keys.map(k => `${origin}:${k}`);

  const filter: Filter = {
    kinds: [30078],
    authors: [ctx.currentPubkey],
    "#d": dTags,
  };

  // Use querySync (which returns Promise<Event[]>) since list isn't on SimplePool type here
  const events = await ctx.pool.querySync(ctx.relays, filter);
  if (events.length === 0) return null;

  // Sort events by created_at ascending (oldest first) so newer updates overwrite older ones
  const sortedEvents = [...events].sort((a, b) => a.created_at - b.created_at);

  // Merge all found events
  let merged: any = {};

  for (const event of sortedEvents) {
    const content = event.content;
    let parsed: any = null;

    // 1. Try JSON
    try {
      parsed = JSON.parse(content);
    } catch { }

    // 2. Try Decrypt
    if (!parsed && event.pubkey === ctx.currentPubkey) {
      try {
        const plaintext = await ctx.requestDecrypt(ctx.currentPubkey, content);
        parsed = JSON.parse(plaintext);
      } catch { }
    }

    if (parsed) {
      merged = { ...merged, ...parsed };
    }
  }

  return merged as T;
}

/**
 * Internal Helper: Put NIP-78 Data (Private by default, System Origin)
 */
async function internalPutStorage<T>(
  ctx: KeyStorageContext,
  key: string,
  value: T
): Promise<Event> {
  if (!ctx.currentPubkey) throw new Error("Not authenticated");

  const origin = SYSTEM_APP_ORIGIN;
  const dTag = `${origin}:${key}`;

  const plaintext = typeof value === "string" ? value : JSON.stringify(value);
  const content = await ctx.requestEncrypt(ctx.currentPubkey, plaintext);

  const unsignedEvent: UnsignedNostrEvent = {
    kind: 30078,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["d", dTag]],
    content: content,
  };

  const signedEvent = await ctx.requestSign(unsignedEvent);
  await Promise.any(ctx.pool.publish(ctx.relays, signedEvent));

  return signedEvent;
}


