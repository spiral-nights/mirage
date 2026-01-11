/**
 * Mirage Bridge - Preview Mode Mock Handler
 * 
 * Handles ALL API requests in-memory for preview mode without requiring NIP-07 signing.
 * Response shapes match the real engine (see engine/routes/*.ts)
 * 
 * Endpoints Covered:
 * - /ready, /events
 * - /user/me, /users/:pubkey, /profiles/:pubkey
 * - /contacts, /contacts/:pubkey
 * - /storage/:key
 * - /spaces, /spaces/:id, /spaces/:id/messages, /spaces/:id/store, /spaces/:id/invite
 * - /dms, /dms/:pubkey
 * - /library/apps
 */

// Import standardized matcher
import { matchRoute } from '../engine/route-matcher';

// ============================================================================
// Type Definitions (matching engine response shapes)
// ============================================================================

interface MockSpace {
    id: string;
    name: string;
    createdAt: number;
    memberCount: number;
    appOrigin?: string;
}

interface MockMessage {
    id: string;
    spaceId: string;
    author: string;
    content: string;
    type: 'message';
    createdAt: number;
}

interface MockProfile {
    pubkey: string;
    name?: string;
    about?: string;
    picture?: string;
    nip05?: string;
}

interface MockContact {
    pubkey: string;
    relay?: string;
    petname?: string;
}

interface MockDM {
    id: string;
    author: string;
    recipient: string;
    content: string;
    createdAt: number;
}

interface MockEvent {
    id: string;
    kind: number;
    content: string;
    pubkey: string;
    created_at: number;  // snake_case for raw events
    tags: string[][];
    sig?: string;
}

interface MockApp {
    naddr: string;
    name: string;
    author: string;
    createdAt: number;
}

// ============================================================================
// In-Memory Storage
// ============================================================================

const previewSpaces = new Map<string, MockSpace>();
const previewMessages = new Map<string, MockMessage[]>();
const previewStore = new Map<string, Map<string, any>>();
const previewStorage = new Map<string, any>();
const previewContacts: MockContact[] = [];
const previewDMs = new Map<string, MockDM[]>(); // pubkey -> messages
const previewEvents: MockEvent[] = [];
const previewLibrary: MockApp[] = [];

// Mock user for preview mode
const PREVIEW_PUBKEY = 'preview' + Array.from({ length: 60 }, () =>
    Math.floor(Math.random() * 16).toString(16)
).join('');

const PREVIEW_PROFILE: MockProfile = {
    pubkey: PREVIEW_PUBKEY,
    name: 'Preview User',
    about: 'This is a preview session',
    picture: '',
};

let currentSpace: { id: string; name: string } | null = null;

export function setPreviewSpaceContext(id: string, name: string): void {
    currentSpace = { id, name };
}

function resolveSpaceId(spaceId: string): string {
    if (spaceId === 'current') {
        return currentSpace?.id || 'default';
    }
    return spaceId;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(): string {
    return Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}

function jsonResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function now(): number {
    return Math.floor(Date.now() / 1000);
}

// ============================================================================
// GET Handler
// ============================================================================

async function handlePreviewGet(path: string): Promise<Response> {
    await new Promise(resolve => setTimeout(resolve, 350));

    // Remove query string for matching
    const [cleanPath, queryString] = path.split('?');
    const params: Record<string, string> = {};
    if (queryString) {
        new URLSearchParams(queryString).forEach((val, key) => params[key] = val);
    }

    // === System ===
    if (path === '/mirage/v1/ready') {
        return jsonResponse({ ready: true, authenticated: true, relayCount: 3 });
    }

    // === Space Context ===
    if (path === '/mirage/v1/space') {
        if (currentSpace) return jsonResponse(currentSpace);
        return jsonResponse({ id: null, standalone: true });
    }

    // === Events ===
    if (path.startsWith('/mirage/v1/events')) {
        // Return mock events (could parse query params for filtering)
        return jsonResponse(previewEvents);
    }

    // === User/Profile ===
    if (path === '/mirage/v1/user/me') {
        return jsonResponse(PREVIEW_PROFILE);
    }

    const profilesMatch = matchRoute("/mirage/v1/users/:pubkey", cleanPath);
    if (profilesMatch) {
        const { pubkey } = profilesMatch;
        // Return a mock profile for any pubkey
        return jsonResponse({
            pubkey,
            name: `User ${pubkey.slice(0, 8)}`,
            about: 'Mock profile',
        });
    }

    // === Contacts ===
    if (path === '/mirage/v1/contacts') {
        return jsonResponse(previewContacts);
    }

    const contactsMatch = matchRoute("/mirage/v1/contacts/:pubkey", cleanPath);
    if (contactsMatch) {
        // Return empty contacts for other users
        return jsonResponse([]);
    }

    // === Storage ===
    const storageMatch = matchRoute("/mirage/v1/storage/:key", cleanPath);
    if (storageMatch) {
        const { key } = storageMatch;
        const value = previewStorage.get(key);
        return jsonResponse(value !== undefined ? value : null);
    }

    // === Spaces ===
    if (path === '/mirage/v1/spaces') {
        return jsonResponse(Array.from(previewSpaces.values()));
    }

    if (path === '/mirage/v1/admin/spaces') {
        return jsonResponse(Array.from(previewSpaces.values()));
    }

    // GET /spaces/:id/messages
    const messagesMatch = matchRoute("/mirage/v1/spaces/:id/messages", cleanPath);
    if (messagesMatch) {
        const spaceId = resolveSpaceId(messagesMatch.id);
        const limit = params.limit ? parseInt(params.limit) : 50;
        const messages = previewMessages.get(spaceId) || [];
        return jsonResponse(messages.slice(-limit));
    }

    // GET /spaces/:id/store
    const storeMatch = matchRoute("/mirage/v1/spaces/:id/store", cleanPath);
    if (storeMatch) {
        const spaceId = resolveSpaceId(storeMatch.id);
        const store = previewStore.get(spaceId);
        return jsonResponse(store ? Object.fromEntries(store) : {});
    }

    // GET /spaces/:id (single space)
    const spaceMatch = matchRoute("/mirage/v1/spaces/:id", cleanPath) ||
        matchRoute("/mirage/v1/admin/spaces/:id", cleanPath);
    if (spaceMatch) {
        const spaceId = resolveSpaceId(spaceMatch.id);
        const space = previewSpaces.get(spaceId);
        if (space) return jsonResponse(space);
        return jsonResponse({ error: 'Space not found' }, 404);
    }

    // === DMs ===
    if (path === '/mirage/v1/dms') {
        // Return list of conversations
        const conversations = Array.from(previewDMs.keys()).map(pubkey => ({
            pubkey,
            lastMessage: previewDMs.get(pubkey)?.slice(-1)[0]?.content || '',
            lastAt: previewDMs.get(pubkey)?.slice(-1)[0]?.createdAt || 0,
        }));
        return jsonResponse(conversations);
    }

    const dmMatch = matchRoute("/mirage/v1/dms/:pubkey", cleanPath);
    if (dmMatch) {
        const { pubkey } = dmMatch;
        return jsonResponse(previewDMs.get(pubkey) || []);
    }

    // === Library ===
    if (path === '/mirage/v1/library/apps') {
        return jsonResponse(previewLibrary);
    }

    // Default
    return jsonResponse([]);
}

// ============================================================================
// POST Handler
// ============================================================================

async function handlePreviewPost(path: string, body: any): Promise<Response> {
    const [cleanPath] = path.split('?');

    // === Events ===
    if (path === '/mirage/v1/events') {
        const event: MockEvent = {
            id: generateId(),
            kind: body?.kind || 1,
            content: body?.content || '',
            pubkey: PREVIEW_PUBKEY,
            created_at: now(),
            tags: body?.tags || [],
        };
        previewEvents.push(event);
        return jsonResponse(event, 201);
    }

    // === Spaces ===
    if (path === '/mirage/v1/spaces') {
        const spaceId = generateId();
        const space: MockSpace = {
            id: spaceId,
            name: body?.name || 'Unnamed Space',
            createdAt: now(),
            memberCount: 1,
        };
        previewSpaces.set(spaceId, space);
        previewMessages.set(spaceId, []);
        previewStore.set(spaceId, new Map());
        return jsonResponse(space, 201);
    }

    // POST /spaces/:id/messages
    const messagesMatch = matchRoute("/mirage/v1/spaces/:id/messages", cleanPath);
    if (messagesMatch) {
        const spaceId = resolveSpaceId(messagesMatch.id);
        if (!previewMessages.has(spaceId)) {
            previewMessages.set(spaceId, []);
        }
        const message: MockMessage = {
            id: generateId(),
            spaceId,
            author: PREVIEW_PUBKEY,
            content: body?.content || '',
            type: 'message',
            createdAt: now(),
        };
        previewMessages.get(spaceId)!.push(message);
        return jsonResponse(message, 201);
    }

    // POST /spaces/:id/invitations (supports /admin prefix)
    const inviteMatch = matchRoute("/mirage/v1/spaces/:id/invitations", cleanPath) ||
        matchRoute("/mirage/v1/admin/spaces/:id/invitations", cleanPath);
    if (inviteMatch) {
        return jsonResponse({ invited: body?.pubkey, success: true });
    }

    // === DMs ===
    const dmMatch = matchRoute("/mirage/v1/dms/:pubkey", cleanPath);
    if (dmMatch) {
        const recipient = dmMatch.pubkey;
        if (!previewDMs.has(recipient)) {
            previewDMs.set(recipient, []);
        }
        const dm: MockDM = {
            id: generateId(),
            author: PREVIEW_PUBKEY,
            recipient,
            content: body?.content || '',
            createdAt: now(),
        };
        previewDMs.get(recipient)!.push(dm);
        return jsonResponse(dm, 201);
    }

    // === Library ===
    if (path === '/mirage/v1/library/apps') {
        const app: MockApp = {
            naddr: body?.naddr || generateId(),
            name: body?.name || 'Preview App',
            author: PREVIEW_PUBKEY,
            createdAt: now(),
        };
        previewLibrary.push(app);
        return jsonResponse({ success: true }, 201);
    }

    // Default
    return jsonResponse({ success: true });
}

// ============================================================================
// PUT Handler
// ============================================================================

async function handlePreviewPut(path: string, body: any): Promise<Response> {
    const [cleanPath] = path.split('?');

    // === Contacts ===
    if (path === '/mirage/v1/contacts') {
        previewContacts.length = 0;
        if (body?.contacts && Array.isArray(body.contacts)) {
            previewContacts.push(...body.contacts);
        }
        return jsonResponse({ success: true });
    }

    // === Storage ===
    const storageMatch = matchRoute("/mirage/v1/storage/:key", cleanPath);
    if (storageMatch) {
        const { key } = storageMatch;
        previewStorage.set(key, body);
        return jsonResponse({ success: true });
    }

    // === Spaces Store ===
    const storeKeyMatch = matchRoute("/mirage/v1/spaces/:id/store/:key", cleanPath);
    if (storeKeyMatch) {
        const spaceId = resolveSpaceId(storeKeyMatch.id);
        const key = storeKeyMatch.key;
        if (!previewStore.has(spaceId)) {
            previewStore.set(spaceId, new Map());
        }
        previewStore.get(spaceId)!.set(key, body);
        return jsonResponse({ key, value: body, updatedAt: now() });
    }

    // Default
    return jsonResponse({ success: true });
}

// ============================================================================
// DELETE Handler
// ============================================================================

async function handlePreviewDelete(path: string): Promise<Response> {
    const [cleanPath] = path.split('?');

    // === Storage ===
    const storageMatch = matchRoute("/mirage/v1/storage/:key", cleanPath);
    if (storageMatch) {
        const { key } = storageMatch;
        previewStorage.delete(key);
        return jsonResponse({ deleted: true, key });
    }

    // === Spaces ===
    const spaceMatch = matchRoute("/mirage/v1/spaces/:id", cleanPath) ||
        matchRoute("/mirage/v1/admin/spaces/:id", cleanPath);
    if (spaceMatch) {
        const spaceId = resolveSpaceId(spaceMatch.id);
        previewSpaces.delete(spaceId);
        previewMessages.delete(spaceId);
        previewStore.delete(spaceId);
        return jsonResponse({ deleted: spaceId });
    }

    // === Library ===
    if (path === '/mirage/v1/library/apps') {
        // Would need body for naddr, just return success
        return jsonResponse({ deleted: true });
    }

    return jsonResponse({ success: true });
}

// ============================================================================
// Main Request Handler
// ============================================================================

export async function handlePreviewRequest(
    method: string,
    path: string,
    body?: any
): Promise<Response> {
    switch (method) {
        case 'GET':
            return handlePreviewGet(path);
        case 'POST':
            return handlePreviewPost(path, body);
        case 'PUT':
            return handlePreviewPut(path, body);
        case 'DELETE':
            return handlePreviewDelete(path);
        default:
            return jsonResponse({ error: 'Method not supported' }, 405);
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function clearPreviewData(): void {
    previewSpaces.clear();
    previewMessages.clear();
    previewStore.clear();
    previewStorage.clear();
    previewContacts.length = 0;
    previewDMs.clear();
    previewEvents.length = 0;
    previewLibrary.length = 0;
}

// Export for testing
export {
    previewSpaces,
    previewMessages,
    previewStore,
    previewStorage,
    previewContacts,
    previewDMs,
    previewEvents,
    previewLibrary,
    PREVIEW_PUBKEY,
};
