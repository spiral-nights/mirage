/**
 * Mirage Bridge - Fetch Interceptor
 *
 * Intercepts fetch() calls to /mirage/ routes and routes them to the Engine.
 */

import type { ApiRequestMessage, StreamOpenMessage } from '../types';
import {
    engineReady,
    originalFetch,
    pendingRequests,
    activeStreams,
    postToEngine,
    currentAppOrigin,
} from './messaging';
import { handlePreviewRequest } from './preview-mock';

// ============================================================================
// Fetch Interceptor
// ============================================================================

/**
 * Intercepted fetch that routes /mirage/ calls to the Engine
 */
export async function interceptedFetch(rawInput: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Only intercept /mirage/ routes
    const url = typeof rawInput === 'string' ? rawInput : rawInput instanceof Request ? rawInput.url : rawInput.toString();
    if (!url.startsWith('/mirage/')) {
        return originalFetch(rawInput, init);
    }

    // Wait for bridge to be initialized
    await engineReady;

    // Debug: Log current app origin for all requests
    console.log(`[Bridge] Intercepted ${init?.method || 'GET'} ${url}, currentAppOrigin=${currentAppOrigin}`);

    // PREVIEW MODE: Handle requests in-memory without engine/signing
    if (currentAppOrigin === '__preview__') {
        const method = (init?.method?.toUpperCase() || 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE';
        let body: unknown = undefined;
        if (init?.body) {
            try {
                body = JSON.parse(init.body as string);
            } catch {
                body = init.body;
            }
        }

        console.log(`[Bridge PREVIEW] Routing to mock handler: ${method} ${url}`);
        const response = await handlePreviewRequest(method, url, body);
        console.log(`[Bridge PREVIEW] Mock handler returned: status=${response.status}`);
        return response;
    }

    // Check for Streaming Request
    const headers = new Headers(init?.headers);
    if (headers.get('Accept') === 'text/event-stream') {
        return handleStreamingRequest(url, init);
    }

    // Standard JSON Request
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
            headers: Object.fromEntries(headers.entries()),
        };

        postToEngine(message);

        // Timeout 30s
        setTimeout(() => {
            if (pendingRequests.has(id)) {
                pendingRequests.delete(id);
                reject(new Error('Request timed out'));
            }
        }, 30000);
    });
}

// ============================================================================
// Streaming Request Handler
// ============================================================================

function handleStreamingRequest(url: string, init?: RequestInit): Response {
    const id = crypto.randomUUID();
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Create controller wrapper to decouple from TransformStream internals
    const controller = {
        enqueue: (chunk: Uint8Array) => writer.write(chunk),
        close: () => writer.close(),
        error: (err: Error) => writer.abort(err)
    };

    activeStreams.set(id, { controller });

    const method = (init?.method?.toUpperCase() || 'GET') as 'GET';
    const message: StreamOpenMessage = {
        type: 'STREAM_OPEN',
        id,
        method,
        path: url,
        headers: init?.headers ? Object.fromEntries(new Headers(init.headers).entries()) : undefined,
    };

    postToEngine(message);

    return new Response(readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        }
    });
}
