/**
 * Mirage Engine - Web Worker Entry Point
 *
 * The "Virtual Backend" that handles API requests and manages relay connections.
 */

import { SimplePool } from "nostr-tools";
import { MirageEngine } from "./MirageEngine";


import { SYSTEM_APP_ORIGIN } from "./keys";
import type {
  MirageMessage,
  ApiRequestMessage,
  ApiResponseMessage,
  RelayConfigMessage,
} from "../types";
import { handleStreamOpen } from "./streaming";
import {
  requestSign,
  handleSignatureResult,
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

// V2 Engine
const mirageEngine = new MirageEngine({
  pool,
  relays: activeRelays
});



function setCurrentPubkey(pubkey: string): void {
  currentPubkey = pubkey;
}



// ============================================================================
// Message Handler
// ============================================================================

self.onmessage = async (event: MessageEvent<MirageMessage>) => {
  const message = event.data;

  switch (message.type) {
    case "RELAY_CONFIG":
      await mirageEngine.handleMessage(message);
      await handleRelayConfig(message);
      break;

    case "API_REQUEST":
      await handleApiRequest(message);
      break;

    case "ACTION_FETCH_APP":
      await mirageEngine.handleMessage(message);
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
      await mirageEngine.handleMessage(message);
      setCurrentPubkey((message as any).pubkey);

      break;

    case "SET_APP_ORIGIN":
      const payload = message as any;
      appOrigin = payload.origin;
      console.log(
        `[Engine] App origin set: ${appOrigin?.slice(0, 20)}...`,
      );
      await mirageEngine.handleMessage(message);
      break;

    case "SET_SPACE_CONTEXT":
      const ctxMsg = message as any;
      currentSpace = { id: ctxMsg.spaceId, name: ctxMsg.spaceName };
      console.log("[Engine] Space context set:", currentSpace);
      await mirageEngine.handleMessage(message);
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

  // Wait for keys to be loaded before handling any spaces or admin requests
  // V2 Migration: Delegate routes to MirageEngine
  const delegationPaths = [
    "/mirage/v1/space",
    "/mirage/v1/admin/spaces",
    "/mirage/v1/admin/apps",
    "/mirage/v1/contacts",
    "/mirage/v1/dms",
    "/mirage/v1/events",
    "/mirage/v1/user",
    "/mirage/v1/users"
  ];
  const isDelegatedPath = delegationPaths.find((val) => path.startsWith(val))

  if (isDelegatedPath) {
    await mirageEngine.handleMessage(message as MirageMessage); // MirageEngine sends response internally
    return;
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
  _requestPool: SimplePool,
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
