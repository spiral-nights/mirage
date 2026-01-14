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

export class KeyManager {
  private pool: SimplePool;

  constructor(pool: SimplePool) {
    this.pool = pool;
  }
}

/**
 * Load all space keys from NIP-78 storage.
 * Returns a Map of ScopedSpaceId -> SpaceKey.
 */
export async function loadSpaceKeys(
  ctx: KeyStorageContext,
): Promise<Map<string, SpaceKey>> {
  try {
    const rawMap = await internalGetStorage<KeyMap>(ctx, KEY_STORAGE_ID);

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
): Promise<void> {
  try {
    const rawMap: KeyMap = {};
    for (const [id, keyInfo] of keys.entries()) {
      rawMap[id] = keyInfo;
    }

    await internalPutStorage(ctx, KEY_STORAGE_ID, rawMap);
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
  key: string
): Promise<T | null> {
  if (!ctx.currentPubkey) return null;

  // Force system origin for keys
  const origin = SYSTEM_APP_ORIGIN;
  const dTag = `${origin}:${key}`;

  const filter: Filter = {
    kinds: [30078],
    authors: [ctx.currentPubkey],
    "#d": [dTag],
    limit: 1,
  };

  const event = await ctx.pool.get(ctx.relays, filter);
  if (!event) return null;

  const content = event.content;

  // 1. Try JSON
  try {
    return JSON.parse(content);
  } catch { }

  // 2. Try Decrypt
  if (event.pubkey === ctx.currentPubkey) {
    try {
      const plaintext = await ctx.requestDecrypt(ctx.currentPubkey, content);
      try {
        return JSON.parse(plaintext);
      } catch {
        return plaintext as unknown as T;
      }
    } catch { }
  }

  return content as unknown as T;
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


