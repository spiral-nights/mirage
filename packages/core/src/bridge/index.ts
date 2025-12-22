/**
 * Mirage Bridge - Fetch Interceptor
 *
 * Monkey-patches window.fetch to intercept /api/ calls and route them to the Web Worker.
 */

import type { ApiRequestMessage, ApiResponseMessage, MirageMessage } from '../types';

// ============================================================================
// Types
// ============================================================================

interface PendingRequest {
    resolve: (response: Response) => void;
    reject: (error: Error) => void;
}

// ============================================================================
// State
// ============================================================================

let worker: Worker | null = null;
const pendingRequests = new Map<string, PendingRequest>();
const originalFetch = window.fetch.bind(window);

// ============================================================================
// Worker Communication
// ============================================================================

function handleWorkerMessage(event: MessageEvent<MirageMessage>): void {
    const message = event.data;

    if (message.type === 'API_RESPONSE') {
        console.log('[Bridge] Response from worker:', message.status, message.body);
        const pending = pendingRequests.get(message.id);
        if (pending) {
            pendingRequests.delete(message.id);
            const response = new Response(JSON.stringify(message.body), {
                status: message.status,
                headers: {
                    'Content-Type': 'application/json',
                    ...message.headers,
                },
            });
            pending.resolve(response);
        }
    }

    // Forward other messages (like ACTION_SIGN_EVENT) to parent
    if (message.type === 'ACTION_SIGN_EVENT') {
        window.parent.postMessage(message, '*');
    }
}

// Listen for signature results from parent
function handleParentMessage(event: MessageEvent<MirageMessage>): void {
    const message = event.data;

    if (message.type === 'SIGNATURE_RESULT' && worker) {
        worker.postMessage(message);
    }

    if (message.type === 'RELAY_CONFIG' && worker) {
        worker.postMessage(message);
    }

    if (message.type === 'SET_PUBKEY' && worker) {
        worker.postMessage(message);
    }
}

// ============================================================================
// Fetch Interceptor
// ============================================================================

function interceptedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Only intercept /mirage/ routes
    if (!url.startsWith('/mirage/')) {
        return originalFetch(input, init);
    }

    if (!worker) {
        return Promise.reject(new Error('Mirage Bridge not initialized'));
    }

    return new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        pendingRequests.set(id, { resolve, reject });

        const method = (init?.method?.toUpperCase() || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE';

        let body: unknown = undefined;
        if (init?.body) {
            try {
                body = JSON.parse(init.body as string);
            } catch {
                body = init.body;
            }
        }

        const message: ApiRequestMessage = {
            type: 'API_REQUEST',
            id,
            method,
            path: url,
            body,
            headers: init?.headers as Record<string, string>,
        };

        console.log('[Bridge] Sending request to worker:', method, url);
        worker!.postMessage(message);

        // Timeout after 30 seconds
        setTimeout(() => {
            if (pendingRequests.has(id)) {
                pendingRequests.delete(id);
                reject(new Error('Request timed out'));
            }
        }, 30000);
    });
}

// ============================================================================
// Initialization
// ============================================================================

export interface BridgeOptions {
    workerUrl: string;
}

export async function initBridge(options: BridgeOptions): Promise<void> {
    if (worker) {
        console.warn('[Bridge] Already initialized');
        return;
    }

    console.log('[Bridge] Initializing, fetching engine from:', options.workerUrl);

    // Fetch the engine code and create a Blob URL
    // This bypasses the null origin restriction on Worker creation
    const response = await fetch(options.workerUrl);
    if (!response.ok) {
        throw new Error(`Failed to load engine: ${response.status} ${response.statusText}`);
    }
    const engineCode = await response.text();
    const engineBlob = new Blob([engineCode], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(engineBlob);

    console.log('[Bridge] Engine fetched, creating Worker from Blob URL');

    // Create the Web Worker from Blob URL (classic mode, not module)
    worker = new Worker(blobUrl);
    worker.onmessage = handleWorkerMessage;
    worker.onerror = (error) => {
        console.error('[Bridge] Worker error:', error);
    };

    // Listen for messages from parent window
    window.addEventListener('message', handleParentMessage);

    // Monkey-patch fetch (use type assertion for Bun compatibility)
    (window as { fetch: typeof interceptedFetch }).fetch = interceptedFetch;

    console.log('[Bridge] Initialized');

    // Signal to parent that bridge is ready
    window.parent.postMessage({ type: 'BRIDGE_READY' }, '*');
}

export function destroyBridge(): void {
    if (worker) {
        worker.terminate();
        worker = null;
    }
    window.fetch = originalFetch;
    pendingRequests.clear();
    window.removeEventListener('message', handleParentMessage);
}

// Export for parent to send config
export function sendToWorker(message: MirageMessage): void {
    if (worker) {
        worker.postMessage(message);
    }
}
