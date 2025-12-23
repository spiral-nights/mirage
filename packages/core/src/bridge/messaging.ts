/**
 * Mirage Bridge - Message Routing
 *
 * Handles message passing between Bridge and Engine/Host.
 */

import type { MirageMessage } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface PendingRequest {
    resolve: (response: Response) => void;
    reject: (error: Error) => void;
}

export interface ActiveStream {
    controller: {
        enqueue(chunk: Uint8Array): void;
        close(): void;
        error(err: Error): void;
    };
}

// ============================================================================
// State
// ============================================================================

export let enginePort: MessagePort | Worker | Window | null = null;
export let isChildMode = false;
let engineReadyResolve: () => void;

export const engineReady = new Promise<void>((resolve) => {
    engineReadyResolve = resolve;
});

export const pendingRequests = new Map<string, PendingRequest>();
export const activeStreams = new Map<string, ActiveStream>();
export const originalFetch = window.fetch.bind(window);

// ============================================================================
// State Setters (for initialization)
// ============================================================================

export function setEnginePort(port: MessagePort | Worker | Window | null): void {
    enginePort = port;
}

export function setChildMode(value: boolean): void {
    isChildMode = value;
}

export function signalEngineReady(): void {
    engineReadyResolve();
}

// ============================================================================
// Message Handlers
// ============================================================================

/**
 * Handle messages coming FROM the Engine (or Host acting as Engine)
 */
export function handleEngineMessage(event: MessageEvent<MirageMessage>): void {
    const message = event.data;

    // Route: API Response
    if (message.type === 'API_RESPONSE') {
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
    // Route: Stream Chunk
    else if (message.type === 'STREAM_CHUNK') {
        const stream = activeStreams.get(message.id);
        if (stream) {
            stream.controller.enqueue(new TextEncoder().encode(message.chunk));
        }
    }
    // Route: Stream Close
    else if (message.type === 'STREAM_CLOSE') {
        const stream = activeStreams.get(message.id);
        if (stream) {
            stream.controller.close();
            activeStreams.delete(message.id);
        }
    }
    // Route: Stream Error
    else if (message.type === 'STREAM_ERROR') {
        const stream = activeStreams.get(message.id);
        if (stream) {
            stream.controller.error(new Error(message.error));
            activeStreams.delete(message.id);
        }
    }
}

/**
 * Send message TO the Engine
 */
export function postToEngine(message: MirageMessage): void {
    if (!enginePort) {
        console.warn('[Bridge] Engine not connected, dropping message:', message.type);
        return;
    }
    // Child Mode: post to parent window
    // Note: We use the isChildMode flag because instanceof Window fails for cross-origin proxies
    if (isChildMode) {
        (enginePort as Window).postMessage(message, '*');
    }
    // Standalone Mode: post to worker
    else {
        (enginePort as Worker).postMessage(message);
    }
}
