/**
 * Mirage Engine - Web Worker Entry Point
 *
 * The "Virtual Backend" that handles API requests and manages relay connections.
 */

import type { Event } from "nostr-tools";
import { RelayPool } from "./relay-pool";

import {
  getCurrentUser,
  getUserByPubkey,
  type UserRouteContext,
} from "./routes/user";
import {
  getStorage,
  putStorage,
  deleteStorage,
  type StorageRouteContext,
} from "./routes/storage";
import {
  listSpaces,
  listAllSpaces,
  createSpace,
  deleteSpace,
  getSpaceMessages,
  postSpaceMessage,
  inviteMember,
  syncInvites,
  getSpaceStore,
  updateSpaceStore,
  getSpaceContext,
  type SpaceRouteContext,
} from "./routes/spaces";
import {
  listDMs,
  getDMMessages,
  sendDM,
  type DMRouteContext,
} from "./routes/dm";
import {
  listContacts,
  getUserContacts,
  updateContacts,
  type ContactsRouteContext,
} from "./routes/contacts";
import {
  getEvents,
  postEvents,
  type EventsRouteContext,
} from "./routes/events";
import { fetchAppCode } from "./routes/apps";
import {
  loadAppLibrary,
  addAppToLibrary,
  removeAppFromLibrary,
} from "./library";
import { loadSpaceKeys } from "./keys";
import type {
  MirageMessage,
  ApiRequestMessage,
  ApiResponseMessage,
  RelayConfigMessage,
  FetchAppRequestMessage,
  FetchAppResultMessage,
} from "../types";
import { handleStreamOpen, sendStreamError } from "./streaming";
import {
  requestSign,
  handleSignatureResult,
  requestEncrypt,
  requestDecrypt,
  handleEncryptResult,
  handleDecryptResult,
} from "./signing";

// ============================================================================
// State
// ============================================================================

let pool: RelayPool | null = null;
let poolReadyResolve: () => void;
const poolReady = new Promise<void>((resolve) => {
  poolReadyResolve = resolve;
});
let currentPubkey: string | null = null;
let appOrigin: string = "mirage-app";
let currentSpace: { id: string; name: string } | undefined;

// Keys preloading state - resolves when keys are loaded from relays
let keysReadyResolve: (() => void) | null = null;
let keysReady: Promise<void> | null = null;

function setCurrentPubkey(pubkey: string): void {
  currentPubkey = pubkey;
}

/**
 * Initialize the keys preloading promise.
 * Called when SET_PUBKEY is received.
 */
function initKeysPreload(): void {
  if (keysReady) return; // Already initializing
  keysReady = new Promise<void>((resolve) => {
    keysReadyResolve = resolve;
  });
}

let isLoggingWaiting = false;

/**
 * Wait for keys to be loaded. Used by spaces API to block until ready.
 * If SET_PUBKEY hasn't been received yet, waits briefly then checks again.
 * Returns true if keys are ready, false if they timed out.
 */
export async function waitForKeysReady(): Promise<boolean> {
  // If keysReady is null, SET_PUBKEY hasn't been received yet
  // Wait for it to arrive
  let attempts = 0;
  while (!keysReady && attempts < 100) {
    // Wait up to 10 seconds total
    if (attempts === 0)
      console.log("[Engine] waitForKeysReady: Waiting for SET_PUBKEY...");
    await new Promise((r) => setTimeout(r, 100));
    attempts++;
  }

  if (keysReady) {
    if (!isLoggingWaiting) {
      isLoggingWaiting = true;
      console.log("[Engine] Waiting for keys to load from relays...");
      keysReady.finally(() => {
        isLoggingWaiting = false;
      });
    }
    await keysReady;
    return true;
  } else {
    console.warn(
      "[Engine] Keys never initialized - SET_PUBKEY not received after 10s",
    );
    return false;
  }
}

/**
 * Preload space keys so they're available when apps query for spaces.
 * This prevents the race condition where an app queries before keys are loaded.
 */
async function preloadSpaceKeys(): Promise<void> {
  await poolReady;
  if (!pool || !currentPubkey) {
    keysReadyResolve?.(); // Resolve anyway if not authenticated
    return;
  }

  console.log("[Engine] Preloading space keys...");
  const ctx: SpaceRouteContext = {
    pool,
    requestSign,
    requestEncrypt,
    requestDecrypt,
    currentPubkey,
    appOrigin,
  };

  try {
    await loadSpaceKeys(ctx);
    console.log("[Engine] Space keys preloaded");
  } catch (e) {
    console.error("[Engine] Failed to preload space keys:", e);
  } finally {
    // Start background sync loop regardless of load success
    startBackgroundSync();
    keysReadyResolve?.(); // Always resolve
  }
}

/**
 * Background loop to poll for invites and other background tasks.
 */
function startBackgroundSync(): void {
  console.log("[InviteDebug] Starting background sync loop (60s interval)");

  const runSync = async () => {
    if (!pool || !currentPubkey) return;

    const ctx: SpaceRouteContext = {
      pool,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin,
      currentSpace,
    };

    console.log("[InviteDebug] Running periodic background sync...");
    await syncInvites(ctx);
  };

  // Initial sync
  runSync().catch((err) =>
    console.error("[InviteDebug] Background sync failed:", err),
  );

  // Periodic sync
  setInterval(() => {
    runSync().catch((err) =>
      console.error("[InviteDebug] Background sync failed:", err),
    );
  }, 60000); // Every 60 seconds
}

// ============================================================================
// Message Handler
// ============================================================================

self.onmessage = async (event: MessageEvent<MirageMessage>) => {
  const message = event.data;

  switch (message.type) {
    case "RELAY_CONFIG":
      await handleRelayConfig(message);
      break;

    case "API_REQUEST":
      await handleApiRequest(message);
      break;

    case "ACTION_FETCH_APP":
      await handleFetchApp(message as FetchAppRequestMessage);
      break;

    case "ACTION_GET_RELAY_STATUS":
      self.postMessage({
        type: "RELAY_STATUS_RESULT",
        id: message.id,
        stats: pool ? pool.getStats() : [],
      });
      break;

    case "STREAM_OPEN":
      await poolReady;
      if (pool) {
        await handleStreamOpen(message as any, pool, currentPubkey);
      } else {
        sendStreamError((message as any).id, "Relay pool not initialized");
      }
      break;

    case "SIGNATURE_RESULT":
      handleSignatureResult(message as any, setCurrentPubkey, currentPubkey);
      break;

    case "SET_PUBKEY":
      console.log(
        "[Engine] SET_PUBKEY received:",
        (message as any).pubkey.slice(0, 8) + "...",
      );
      setCurrentPubkey((message as any).pubkey);
      initKeysPreload(); // Initialize promise if not already done
      preloadSpaceKeys(); // Trigger the actual load
      break;

    case "SET_APP_ORIGIN":
      appOrigin = (message as any).origin;
      console.log("[Engine] App origin set:", appOrigin?.slice(0, 20) + "...");
      break;

    case "SET_SPACE_CONTEXT":
      const ctxMsg = message as any;
      currentSpace = { id: ctxMsg.spaceId, name: ctxMsg.spaceName };
      console.log("[Engine] Space context set:", currentSpace);
      break;

    case "ENCRYPT_RESULT":
      handleEncryptResult(message as any);
      break;

    case "DECRYPT_RESULT":
      handleDecryptResult(message as any);
      break;

    default:
      console.warn("[Engine] Unknown message type:", message);
  }
};

// ============================================================================
// Relay Configuration
// ============================================================================

async function handleRelayConfig(message: RelayConfigMessage): Promise<void> {
  if (!pool) {
    pool = new RelayPool();
  }

  switch (message.action) {
    case "SET":
      await pool.setRelays(message.relays);
      break;
    case "ADD":
      await Promise.allSettled(
        message.relays.map((url) => pool!.addRelay(url)),
      );
      break;
    case "REMOVE":
      for (const url of message.relays) {
        pool.removeRelay(url);
      }
      break;
  }

  poolReadyResolve();
}

// ============================================================================
// API Request Router
// ============================================================================

async function handleApiRequest(message: ApiRequestMessage): Promise<void> {
  const start = performance.now();
  await poolReady;

  if (!pool) {
    sendResponse(message.id, 503, { error: "Relay pool not initialized" });
    return;
  }

  const { method, path, body } = message;

  // Track original sender
  const sender = (message as any)._sender;

  // Wait for keys to be loaded before handling any spaces or library requests
  if (
    path.startsWith("/mirage/v1/spaces") ||
    path.startsWith("/mirage/v1/library")
  ) {
    const keysReady = await waitForKeysReady();
    if (!keysReady) {
      sendResponse(message.id, 503, { error: "Keys not ready" });
      return;
    }
  }

  const route = await matchRoute(method, path);
  if (!route) {
    sendResponse(message.id, 404, { error: "Not found" });
    return;
  }

  try {
    const result = await route.handler(body, route.params);
    const duration = performance.now() - start;
    if (duration > 100) {
      console.log(
        `[Engine] SLOW API: ${method} ${path} took ${duration.toFixed(2)}ms`,
      );
    }
    sendResponse(message.id, result.status, result.body);
  } catch (err: any) {
    console.error(`[Engine] API Error: ${method} ${path}`, err);
    sendResponse(message.id, err.status || 500, { error: err.message });
  }
}

// ============================================================================
// Route Matching
// ============================================================================

interface RouteMatch {
  handler: (
    body: unknown,
    params: Record<string, string | string[]>,
  ) => Promise<{ status: number; body: unknown }>;
  params: Record<string, string | string[]>;
}

async function matchRoute(
  method: string,
  fullPath: string,
): Promise<RouteMatch | null> {
  const [path, queryString] = fullPath.split("?");
  const params: Record<string, string | string[]> = {};

  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });
  }

  const eventsCtx: EventsRouteContext = {
    pool: pool!,
    requestSign,
  };

  const userCtx: UserRouteContext = {
    pool: pool!,
    currentPubkey,
  };

  // GET /mirage/v1/ready
  if (method === "GET" && path === "/mirage/v1/ready") {
    return {
      handler: async () => ({
        status: 200,
        body: {
          ready: true,
          authenticated: !!currentPubkey,
          relayCount: pool?.getRelays().length ?? 0,
        },
      }),
      params: {},
    };
  }

  // GET /mirage/v1/events (Query events)
  if (method === "GET" && path === "/mirage/v1/events") {
    return {
      handler: async () => getEvents(eventsCtx, params),
      params,
    };
  }

  // POST /mirage/v1/events (Publish event)
  if (method === "POST" && path === "/mirage/v1/events") {
    return {
      handler: async (body) =>
        postEvents(
          eventsCtx,
          body as { kind: number; content: string; tags?: string[][] },
        ),
      params: {},
    };
  }

  // Legacy /feed support -> redirected to /events?kinds=1
  if (method === "GET" && path === "/mirage/v1/feed") {
    const feedParams = { ...params, kinds: ["1"] };
    return {
      handler: async () => getEvents(eventsCtx, feedParams),
      params: feedParams,
    };
  }

  // Legacy POST /feed -> redirected to /events with kind 1
  if (method === "POST" && path === "/mirage/v1/feed") {
    return {
      handler: async (body: any) => postEvents(eventsCtx, { ...body, kind: 1 }),
      params: {},
    };
  }

  // GET /mirage/v1/user/me
  if (method === "GET" && path === "/mirage/v1/user/me") {
    return {
      handler: async () => getCurrentUser(userCtx),
      params: {},
    };
  }

  // App Library Routes
  if (path.startsWith("/mirage/v1/library/apps")) {
    const storageCtx: StorageRouteContext = {
      pool: pool!,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin: "mirage", // Explicit origin for  data
    };

    if (method === "GET") {
      return {
        handler: async () => ({
          status: 200,
          body: await loadAppLibrary(storageCtx),
        }),
        params: {},
      };
    }

    if (method === "POST") {
      return {
        handler: async (body) => {
          await addAppToLibrary(storageCtx, body as any);
          return { status: 201, body: { success: true } };
        },
        params: {},
      };
    }

    if (method === "DELETE") {
      return {
        handler: async (body) => {
          const { naddr } = body as { naddr: string };
          if (!naddr) {
            return { status: 400, body: { error: "naddr required" } };
          }
          const removed = await removeAppFromLibrary(storageCtx, naddr);
          if (removed) {
            return { status: 200, body: { deleted: naddr } };
          } else {
            return { status: 404, body: { error: "App not found" } };
          }
        },
        params: {},
      };
    }
  }

  // GET /mirage/v1/profiles/:pubkey (New Standard)
  const profilesMatch = path.match(/^\/mirage\/v1\/profiles\/([a-f0-9]{64})$/);
  if (method === "GET" && profilesMatch) {
    return {
      handler: async () => getUserByPubkey(userCtx, profilesMatch[1]),
      params: { pubkey: profilesMatch[1] },
    };
  }

  // GET /mirage/v1/users/:pubkey (Legacy Alias)
  const usersMatch = path.match(/^\/mirage\/v1\/users\/([a-f0-9]{64})$/);
  if (method === "GET" && usersMatch) {
    return {
      handler: async () => getUserByPubkey(userCtx, usersMatch[1]),
      params: { pubkey: usersMatch[1] },
    };
  }

  // Storage routes - /mirage/v1/storage/:key
  const storageMatch = path.match(/^\/mirage\/v1\/storage\/(.+)$/);
  if (storageMatch) {
    const key = decodeURIComponent(storageMatch[1]);
    const storageCtx: StorageRouteContext = {
      pool: pool!,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin,
    };

    if (method === "GET") {
      return {
        handler: async () =>
          getStorage(storageCtx, key, { pubkey: params.pubkey as string }),
        params: { key },
      };
    }

    if (method === "PUT") {
      return {
        handler: async (body) =>
          putStorage(storageCtx, key, body, {
            public: params.public as string,
          }),
        params: { key },
      };
    }

    if (method === "DELETE") {
      return {
        handler: async () => deleteStorage(storageCtx, key),
        params: { key },
      };
    }
  }

  // =========================================================================
  // Space routes
  // =========================================================================

  const spaceCtx: SpaceRouteContext = {
    pool: pool!,
    requestSign,
    requestEncrypt,
    requestDecrypt,
    currentPubkey,
    appOrigin,
    currentSpace,
  };

  // GET /mirage/v1/space
  if (method === "GET" && path === "/mirage/v1/space") {
    return {
      handler: async () => getSpaceContext(spaceCtx),
      params: {},
    };
  }

  // GET /mirage/v1/spaces
  if (method === "GET" && path === "/mirage/v1/spaces") {
    // Sync invites lazily on list
    await syncInvites(spaceCtx);

    return {
      handler: async () => listSpaces(spaceCtx),
      params: {},
    };
  }

  // GET /mirage/v1/spaces/all - List ALL spaces across all apps (for library UI)
  if (method === "GET" && path === "/mirage/v1/spaces/all") {
    await syncInvites(spaceCtx);

    return {
      handler: async () => listAllSpaces(spaceCtx),
      params: {},
    };
  }

  // POST /mirage/v1/spaces
  if (method === "POST" && path === "/mirage/v1/spaces") {
    return {
      handler: async (body) => createSpace(spaceCtx, body as { name: string }),
      params: {},
    };
  }

  // Space-specific routes
  const spaceMatch = path.match(/^\/mirage\/v1\/spaces\/([a-zA-Z0-9_-]+)(.*)$/);
  if (spaceMatch) {
    const spaceId = spaceMatch[1];
    const subPath = spaceMatch[2]; // e.g. "/messages", "/store", or ""

    // Use helper for safe parsing since params can be array
    const getIntParam = (
      p: string | string[] | undefined,
    ): number | undefined => (p ? parseInt(String(p), 10) : undefined);

    // DELETE /mirage/v1/spaces/:id (delete the space itself)
    if (method === "DELETE" && (subPath === "" || subPath === "/")) {
      return {
        handler: async () => deleteSpace(spaceCtx, spaceId),
        params: { spaceId },
      };
    }

    // GET .../store (Shared KV)
    if (method === "GET" && subPath === "/store") {
      return {
        handler: async () => getSpaceStore(spaceCtx, spaceId),
        params: { spaceId },
      };
    }

    // PUT .../store/:key (Shared KV Update)
    const storeKeyMatch = subPath.match(/^\/store\/(.+)$/);
    if (method === "PUT" && storeKeyMatch) {
      const key = decodeURIComponent(storeKeyMatch[1]);
      return {
        handler: async (body) => updateSpaceStore(spaceCtx, spaceId, key, body),
        params: { spaceId, key },
      };
    }

    // GET .../messages
    if (method === "GET" && subPath === "/messages") {
      return {
        handler: async () =>
          getSpaceMessages(spaceCtx, spaceId, {
            since: getIntParam(params.since),
            limit: getIntParam(params.limit),
          }),
        params: { spaceId },
      };
    }

    // POST .../messages
    if (method === "POST" && subPath === "/messages") {
      return {
        handler: async (body) =>
          postSpaceMessage(spaceCtx, spaceId, body as { content: string }),
        params: { spaceId },
      };
    }

    // POST .../invite
    if (method === "POST" && subPath === "/invite") {
      return {
        handler: async (body) =>
          inviteMember(spaceCtx, spaceId, body as { pubkey: string }),
        params: { spaceId },
      };
    }
  }

  // =========================================================================
  // Direct Message routes (NIP-17)
  // =========================================================================
  const dmCtx: DMRouteContext = {
    pool: pool!,
    requestSign,
    requestEncrypt,
    requestDecrypt,
    currentPubkey,
    appOrigin,
  };

  // GET /mirage/v1/dms
  if (method === "GET" && path === "/mirage/v1/dms") {
    return {
      handler: async () => listDMs(dmCtx),
      params: {},
    };
  }

  // GET /mirage/v1/dms/:pubkey
  const dmMatch = path.match(/^\/mirage\/v1\/dms\/([a-zA-Z0-9]+)$/); // Allow npub/hex
  if (dmMatch) {
    const targetPubkey = dmMatch[1];

    if (method === "GET") {
      const getIntParam = (
        p: string | string[] | undefined,
      ): number | undefined => (p ? parseInt(String(p), 10) : undefined);

      return {
        handler: async () =>
          getDMMessages(dmCtx, targetPubkey, {
            limit: getIntParam(params.limit),
          }),
        params: { pubkey: targetPubkey },
      };
    }

    if (method === "POST") {
      return {
        handler: async (body) =>
          sendDM(dmCtx, targetPubkey, body as { content: string }),
        params: { pubkey: targetPubkey },
      };
    }
  }
  // =========================================================================
  // Contact List routes (NIP-02)
  // =========================================================================
  const contactsCtx: ContactsRouteContext = {
    pool: pool!,
    requestSign,
    requestEncrypt, // Not needed but part of StorageContext
    requestDecrypt,
    currentPubkey,
    appOrigin,
  };

  // GET /mirage/v1/contacts
  if (method === "GET" && path === "/mirage/v1/contacts") {
    return {
      handler: async () => listContacts(contactsCtx),
      params: {},
    };
  }

  // PUT /mirage/v1/contacts
  if (method === "PUT" && path === "/mirage/v1/contacts") {
    return {
      handler: async (body) => updateContacts(contactsCtx, body as any),
      params: {},
    };
  }

  // GET /mirage/v1/contacts/:pubkey
  const contactsMatch = path.match(/^\/mirage\/v1\/contacts\/([a-zA-Z0-9]+)$/);
  if (method === "GET" && contactsMatch) {
    return {
      handler: async () => getUserContacts(contactsCtx, contactsMatch[1]),
      params: { pubkey: contactsMatch[1] },
    };
  }

  return null;
}

// ============================================================================
// Response Helper
// ============================================================================

function sendResponse(id: string, status: number, body: unknown): void {
  const response: ApiResponseMessage = {
    type: "API_RESPONSE",
    id,
    status,
    body,
  };
  self.postMessage(response);
}

async function handleFetchApp(message: FetchAppRequestMessage): Promise<void> {
  await poolReady;
  if (!pool) {
    self.postMessage({
      type: "FETCH_APP_RESULT",
      id: message.id,
      error: "Relay pool not initialized",
    });
    return;
  }

  const result = await fetchAppCode(pool, message.naddr);

  self.postMessage({
    type: "FETCH_APP_RESULT",
    id: message.id,
    ...result,
  });
}

// Export for type checking
export type { UserRouteContext };
