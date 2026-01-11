/**
 * Mirage Engine - Web Worker Entry Point
 *
 * The "Virtual Backend" that handles API requests and manages relay connections.
 */

import { SimplePool, type Filter, type Event } from "nostr-tools";

import { matchRoute } from "./route-matcher";

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
  updateSpace,
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
import { loadSpaceKeys, SYSTEM_APP_ORIGIN } from "./keys";
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

let pool = new SimplePool();
let activeRelays: string[] = [];
let poolReadyResolve: () => void;
const poolReady = new Promise<void>((resolve) => {
  poolReadyResolve = resolve;
});
let currentPubkey: string | null = null;
// Default to system origin for management operations (admin endpoints)
// When an app is mounted, this gets overwritten with the app's canonical ID
let appOrigin: string = SYSTEM_APP_ORIGIN;
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
    relays: activeRelays,
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
  const runSync = async () => {
    if (!pool || !currentPubkey) return;

    const ctx: SpaceRouteContext = {
      pool,
      relays: activeRelays,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin,
      currentSpace,
    };

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
        stats: activeRelays.map((url) => ({ url, status: "active" })),
      });
      break;

    case "STREAM_OPEN":
      await poolReady;
      await handleStreamOpen(message as any, pool, activeRelays, currentPubkey);
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
      const payload = message as any;
      appOrigin = payload.origin;
      console.log(
        `[Engine] App origin set: ${appOrigin?.slice(0, 20)}...`,
      );
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
  switch (message.action) {
    case "SET":
      activeRelays = message.relays;
      break;
    case "ADD":
      message.relays.forEach((url) => {
        if (!activeRelays.includes(url)) activeRelays.push(url);
      });
      break;
    case "REMOVE":
      activeRelays = activeRelays.filter((url) => !message.relays.includes(url));
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
    console.warn(
      `[API] ${message.method} ${message.path} → 503 (pool not initialized)`,
    );
    sendResponse(message.id, 503, { error: "Relay pool not initialized" });
    return;
  }

  const { method, path, body } = message;

  // Track original sender
  const sender = (message as any)._sender;

  // Wait for keys to be loaded before handling any spaces or admin requests
  if (
    path.startsWith("/mirage/v1/space") ||
    path.startsWith("/mirage/v1/admin")
  ) {
    const keysReady = await waitForKeysReady();
    if (!keysReady) {
      console.warn(`[API] ${method} ${path} → 503 (keys not ready)`);
      sendResponse(message.id, 503, { error: "Keys not ready" });
      return;
    }
  }

  // --- OFFLINE ENFORCEMENT REMOVED ---
  const route = await resolveRoute(method, path, pool);
  if (!route) {
    console.warn(`[API] ${method} ${path} → 404 (no matching route)`);
    sendResponse(message.id, 404, { error: "Not found" });
    return;
  }

  try {
    const result = await route.handler(body, route.params);
    const duration = performance.now() - start;

    // Log successful requests with timing
    if (result.status >= 400) {
      console.warn(
        `[API] ${method} ${path} → ${result.status} (${duration.toFixed(0)}ms)`,
      );
    } else {
      console.log(
        `[API] ${method} ${path} → ${result.status} (${duration.toFixed(0)}ms)`,
      );
    }

    sendResponse(message.id, result.status, result.body);
  } catch (err: any) {
    const duration = performance.now() - start;
    console.error(
      `[API] ${method} ${path} → 500 (${duration.toFixed(0)}ms)`,
      err.message,
    );
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

async function resolveRoute(
  method: string,
  fullPath: string,
  requestPool: SimplePool,
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
    pool: requestPool,
    relays: activeRelays,
    requestSign,
  };

  const userCtx: UserRouteContext = {
    pool: requestPool,
    relays: activeRelays,
    currentPubkey,
  };

  const spaceCtx: SpaceRouteContext = {
    pool: requestPool,
    relays: activeRelays,
    requestSign,
    requestEncrypt,
    requestDecrypt,
    currentPubkey,
    appOrigin,
    currentSpace,
  };

  // Helper to check admin access
  const isAdminOrigin = appOrigin === SYSTEM_APP_ORIGIN;

  // GET /mirage/v1/ready
  if (method === "GET" && path === "/mirage/v1/ready") {
    return {
      handler: async () => ({
        status: 200,
        body: {
          ready: true,
          authenticated: !!currentPubkey,
          relayCount: activeRelays.length,
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

  // GET /mirage/v1/user/me
  if (method === "GET" && path === "/mirage/v1/user/me") {
    return {
      handler: async () => getCurrentUser(userCtx),
      params: {},
    };
  }

  // App Library Routes (Admin Only)
  if (path.startsWith("/mirage/v1/admin/apps")) {
    console.log(
      `[API_DEBUG] Handling /admin/apps request. Method=${method} IsAdmin=${isAdminOrigin}`,
    );
    if (!isAdminOrigin) {
      console.warn(`[API_DEBUG] Admin access denied for ${path}`);
      return {
        handler: async () => ({
          status: 403,
          body: { error: "Admin access required" },
        }),
        params: {},
      };
    }

    const storageCtx: StorageRouteContext = {
      pool: requestPool,
      relays: activeRelays,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin: SYSTEM_APP_ORIGIN, // Use constant
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

  // GET /mirage/v1/users/:pubkey - Get user by pubkey
  const usersMatch = matchRoute("/mirage/v1/users/:pubkey", path);
  if (method === "GET" && usersMatch) {
    return {
      handler: async () => getUserByPubkey(userCtx, usersMatch.pubkey),
      params: usersMatch,
    };
  }

  // User Personal Storage - /mirage/v1/space/me/:key
  const storageMatch = matchRoute("/mirage/v1/space/me/:key", path);
  if (storageMatch) {
    const { key } = storageMatch;
    const storageCtx: StorageRouteContext = {
      pool: requestPool,
      relays: activeRelays,
      requestSign,
      requestEncrypt,
      requestDecrypt,
      currentPubkey,
      appOrigin,
      currentSpace,
    };

    if (method === "GET") {
      return {
        handler: async () =>
          getStorage(storageCtx, key, { pubkey: params.pubkey as string }),
        params: storageMatch,
      };
    }

    if (method === "PUT") {
      return {
        handler: async (body) =>
          putStorage(storageCtx, key, body, {
            public: params.public as string,
          }),
        params: storageMatch,
      };
    }

    if (method === "DELETE") {
      return {
        handler: async () => deleteStorage(storageCtx, key),
        params: storageMatch,
      };
    }
  }

  // Admin Reset Route (Wipe everything)
  if (method === "DELETE" && path === "/mirage/v1/admin/state") {
    if (!isAdminOrigin) {
      return {
        handler: async () => ({
          status: 403,
          body: { error: "Admin access required" },
        }),
        params: {},
      };
    }

    return {
      handler: async () => {
        if (!pool || !currentPubkey) {
          return { status: 401, body: { error: "Not authenticated" } };
        }

        console.log("[Admin] Wiping all Mirage data...");
        // 1. Scan for all 30078 events related to Mirage
        const events = await pool.querySync(activeRelays, {
          kinds: [30078],
          authors: [currentPubkey],
          limit: 200,
        });

        const toDelete: string[] = [];

        for (const ev of events) {
          const dTag = ev.tags.find((t) => t[0] === "d")?.[1];
          // Match any mirage-prefixed data or app storage with appOrigin
          if (
            dTag &&
            (dTag.startsWith("mirage:") ||
              dTag.startsWith("mirage-app:") ||
              dTag.startsWith("mirage-studio:") ||
              dTag.includes(":mirage:")) // Double-prefix legacy
          ) {
            console.log(`[Admin] Marking for deletion: ${dTag}`);
            toDelete.push(dTag);
          }
        }

        // 2. Delete them
        if (toDelete.length > 0) {
          for (const dTag of toDelete) {
            // We reuse deleteStorage logic but bypass the context checks since we are admin
            // Manually constructing deletion event
            try {
              console.log(`[Admin] Deleting ${dTag}...`);
              const unsigned = {
                kind: 30078,
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                  ["d", dTag],
                  ["deleted", "true"],
                ],
                content: "",
                pubkey: currentPubkey,
              };
              const signed = await requestSign(unsigned);
              await Promise.all(pool.publish(activeRelays, signed));
            } catch (e) {
              console.error(`[Admin] Failed to delete ${dTag}:`, e);
            }
          }
        }

        return {
          status: 200,
          body: { deletedCount: toDelete.length, keys: toDelete },
        };
      },
      params: {},
    };
  }

  // =========================================================================
  // Space Management Routes
  // =========================================================================

  // GET /mirage/v1/spaces - List spaces for current app
  if (method === "GET" && path === "/mirage/v1/spaces") {
    return {
      handler: async () => listSpaces(spaceCtx),
      params: {},
    };
  }

  // GET /mirage/v1/admin/spaces - List ALL spaces (Admin only)
  if (method === "GET" && path === "/mirage/v1/admin/spaces") {
    return {
      handler: async () => listAllSpaces(spaceCtx),
      params: {},
    };
  }

  // POST /mirage/v1/admin/spaces - Create new space (Admin only)
  if (method === "POST" && path === "/mirage/v1/admin/spaces") {
    return {
      handler: async (body) => createSpace(spaceCtx, body as any),
      params: {},
    };
  }

  // PUT /mirage/v1/admin/spaces/:id - Update space (Admin only)
  const updateSpaceMatch = matchRoute("/mirage/v1/admin/spaces/:id", path);
  if (method === "PUT" && updateSpaceMatch) {
    return {
      handler: async (body) =>
        updateSpace(spaceCtx, updateSpaceMatch.id, body as any),
      params: updateSpaceMatch,
    };
  }

  // DELETE /mirage/v1/spaces/:id - Delete space
  const deleteSpaceMatch = matchRoute("/mirage/v1/spaces/:id", path);
  if (method === "DELETE" && deleteSpaceMatch) {
    return {
      handler: async () => deleteSpace(spaceCtx, deleteSpaceMatch.id),
      params: deleteSpaceMatch,
    };
  }

  // DELETE /mirage/v1/admin/spaces/:id - Delete space (Admin route)
  const adminDeleteSpaceMatch = matchRoute("/mirage/v1/admin/spaces/:id", path);
  if (method === "DELETE" && adminDeleteSpaceMatch) {
    return {
      handler: async () => deleteSpace(spaceCtx, adminDeleteSpaceMatch.id),
      params: adminDeleteSpaceMatch,
    };
  }

  // POST /mirage/v1/admin/spaces/:id/invitations - Invite user to space (Admin route)
  const inviteSpaceMatch = matchRoute(
    "/mirage/v1/admin/spaces/:id/invitations",
    path,
  );
  if (method === "POST" && inviteSpaceMatch) {
    console.log(
      `[Invite_Route] Matched POST /admin/spaces/:id/invitations, spaceId:`,
      inviteSpaceMatch.id,
    );
    return {
      handler: async (body) =>
        inviteMember(
          spaceCtx,
          inviteSpaceMatch.id,
          body as { pubkey: string; name?: string },
        ),
      params: inviteSpaceMatch,
    };
  }

  // =========================================================================
  // Space routes
  // =========================================================================

  // GET /mirage/v1/space - Get current space context
  if (method === "GET" && path === "/mirage/v1/space") {
    return {
      handler: async () => getSpaceContext(spaceCtx),
      params: {},
    };
  }

  // PUT /mirage/v1/space - Set current space context (NEW)
  if (method === "PUT" && path === "/mirage/v1/space") {
    return {
      handler: async (body) => {
        const { spaceId, spaceName } = body as {
          spaceId: string;
          spaceName?: string;
        };
        if (!spaceId) {
          return { status: 400, body: { error: "spaceId required" } };
        }
        // Update the global currentSpace
        currentSpace = { id: spaceId, name: spaceName || "" };
        console.log("[Engine] Space context set via API:", currentSpace);
        return { status: 200, body: { spaceId, spaceName: spaceName || "" } };
      },
      params: {},
    };
  }

  // =========================================================================
  // Implicit Space Routes (use currentSpace)
  // =========================================================================

  // GET /mirage/v1/space/store - Get shared KV store for current space
  if (method === "GET" && path === "/mirage/v1/space/store") {
    if (!currentSpace?.id) {
      return {
        handler: async () => ({
          status: 400,
          body: { error: "No space context set. Use PUT /space first." },
        }),
        params: {},
      };
    }
    return {
      handler: async () => getSpaceStore(spaceCtx, currentSpace!.id),
      params: {},
    };
  }

  // PUT /mirage/v1/space/store/:key - Update shared KV store key
  const implicitStoreMatch = matchRoute("/mirage/v1/space/store/:key", path);
  if (method === "PUT" && implicitStoreMatch) {
    if (!currentSpace?.id) {
      return {
        handler: async () => ({
          status: 400,
          body: { error: "No space context set. Use PUT /space first." },
        }),
        params: {},
      };
    }
    const { key } = implicitStoreMatch;
    return {
      handler: async (body) =>
        updateSpaceStore(spaceCtx, currentSpace!.id, key, body),
      params: { key },
    };
  }

  // GET /mirage/v1/space/messages - Get messages for current space
  if (method === "GET" && path === "/mirage/v1/space/messages") {
    if (!currentSpace?.id) {
      return {
        handler: async () => ({
          status: 400,
          body: { error: "No space context set. Use PUT /space first." },
        }),
        params: {},
      };
    }
    const getIntParam = (
      p: string | string[] | undefined,
    ): number | undefined => (p ? parseInt(String(p), 10) : undefined);
    return {
      handler: async () =>
        getSpaceMessages(spaceCtx, currentSpace!.id, {
          since: getIntParam(params.since),
          limit: getIntParam(params.limit),
        }),
      params: {},
    };
  }

  // POST /mirage/v1/space/messages - Post message to current space
  if (method === "POST" && path === "/mirage/v1/space/messages") {
    if (!currentSpace?.id) {
      return {
        handler: async () => ({
          status: 400,
          body: { error: "No space context set. Use PUT /space first." },
        }),
        params: {},
      };
    }
    return {
      handler: async (body) =>
        postSpaceMessage(
          spaceCtx,
          currentSpace!.id,
          body as { content: string },
        ),
      params: {},
    };
  }

  // POST /mirage/v1/space/invitations - Invite user to current space (system message)
  if (method === "POST" && path === "/mirage/v1/space/invitations") {
    console.log(`[Invite_Route_DEBUG] Matched! currentSpace:`, currentSpace);
    if (!currentSpace?.id) {
      console.log(`[Invite_Route_DEBUG] No space context set, returning 400`);
      return {
        handler: async () => ({
          status: 400,
          body: { error: "No space context set. Use PUT /space first." },
        }),
        params: {},
      };
    }
    console.log(
      `[Invite_Route_DEBUG] Calling inviteMember with space:`,
      currentSpace.id,
    );
    return {
      handler: async (body) =>
        inviteMember(
          spaceCtx,
          currentSpace!.id,
          body as { pubkey: string; name?: string },
        ),
      params: {},
    };
  }

  // =========================================================================
  // DM Routes
  // =========================================================================

  const dmCtx: DMRouteContext = {
    pool: requestPool,
    relays: activeRelays,
    requestSign,
    requestEncrypt,
    requestDecrypt,
    currentPubkey,
    appOrigin,
  };

  // GET /mirage/v1/dms - List DM conversations
  if (method === "GET" && path === "/mirage/v1/dms") {
    return {
      handler: async () => listDMs(dmCtx),
      params: {},
    };
  }

  // GET /mirage/v1/dms/:pubkey/messages - Get messages for a DM conversation
  const dmMessagesMatch = matchRoute("/mirage/v1/dms/:pubkey/messages", path);
  if (method === "GET" && dmMessagesMatch) {
    const peerPubkey = dmMessagesMatch.pubkey;
    return {
      handler: async () =>
        getDMMessages(dmCtx, peerPubkey, {
          // getDMMessages likely only takes limit, not since, based on previous lint feedback
          // If it takes since, add it back. But to be safe and clear lint:
          limit: params.limit ? parseInt(String(params.limit), 10) : undefined,
        }),
      params: { peerPubkey },
    };
  }

  // POST /mirage/v1/dms/:pubkey/messages - Send a DM
  if (method === "POST" && dmMessagesMatch) {
    const peerPubkey = dmMessagesMatch.pubkey;
    return {
      handler: async (body) =>
        sendDM(dmCtx, peerPubkey, {
          content: (body as { content: string }).content,
        }),
      params: { peerPubkey },
    };
  }

  // =========================================================================
  // Contact Routes
  // =========================================================================

  const contactsCtx: ContactsRouteContext = {
    pool: requestPool,
    relays: activeRelays,
    requestSign,
    requestEncrypt,
    requestDecrypt,
    currentPubkey,
    appOrigin,
  };

  // GET /mirage/v1/contacts - Get logged-in user's contacts
  if (method === "GET" && path === "/mirage/v1/contacts") {
    return {
      handler: async () => listContacts(contactsCtx),
      params: {},
    };
  }

  // PUT /mirage/v1/contacts - Update logged-in user's contacts
  if (method === "PUT" && path === "/mirage/v1/contacts") {
    return {
      handler: async (body) => updateContacts(contactsCtx, body as any),
      params: {},
    };
  }

  // GET /mirage/v1/contacts/:pubkey - Get contacts of a specific user
  const userContactsMatch = matchRoute("/mirage/v1/contacts/:pubkey", path);
  if (method === "GET" && userContactsMatch) {
    const { pubkey } = userContactsMatch;
    return {
      handler: async () => getUserContacts(contactsCtx, pubkey),
      params: { pubkey },
    };
  }

  return null;
}

function sendResponse(
  id: string,
  status: number,
  body: unknown,
  headers?: Record<string, string>,
): void {
  const response: ApiResponseMessage = {
    type: "API_RESPONSE",
    id,
    status,
    body,
    headers,
  };
  self.postMessage(response);
}

async function handleFetchApp(message: FetchAppRequestMessage): Promise<void> {
  const result: FetchAppResultMessage = {
    type: "FETCH_APP_RESULT",
    id: message.id,
  };

  try {
    await poolReady;
    if (!pool) throw new Error("Pool not ready");

    const appCode = await fetchAppCode(pool, activeRelays, message.naddr);
    if (appCode.error) {
      result.error = appCode.error;
    } else {
      result.html = appCode.html;
    }
  } catch (e: any) {
    result.error = e.message;
  }

  self.postMessage(result);
}
