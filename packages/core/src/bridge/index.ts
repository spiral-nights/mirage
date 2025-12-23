/**
 * Mirage Bridge - Entry Point
 *
 * Monkey-patches window.fetch to intercept /mirage/ calls.
 * Routes requests to either a Web Worker (Standalone Mode) or Parent Window (Child Mode).
 * Implements Virtual SSE for real-time streaming.
 */

import { interceptedFetch } from './fetch';
import { MirageEventSource } from './event-source';
import {
    enginePort,
    setEnginePort,
    setChildMode,
    signalEngineReady,
    handleEngineMessage,
    pendingRequests,
    activeStreams,
    originalFetch,
    isChildMode
} from './messaging';

// ============================================================================
// Initialization
// ============================================================================

export interface BridgeOptions {
    /** 
     * URL to Engine Worker. 
     * Required if running Standalone. 
     * Ignored if running as Child (Host owns engine).
     */
    workerUrl?: string;

    /**
     * Relay URLs for the Engine to connect to (Standalone Mode)
     */
    relays?: string[];

    /**
     * User's public key (Standalone Mode)
     */
    publicKey?: string;
}

/**
 * Initialize the Mirage Bridge
 */
export async function initBridge(options: BridgeOptions = {}): Promise<void> {
    if (enginePort) {
        console.warn('[Bridge] Already initialized');
        return;
    }

    // 1. Detect Environment
    if (window.parent !== window) {
        // CHILD MODE
        console.log('[Bridge] Detected Child Mode. Connecting to Parent Host...');
        setChildMode(true);
        setEnginePort(window.parent);
        window.addEventListener('message', handleEngineMessage);
    } else {
        // STANDALONE MODE
        console.log('[Bridge] Detected Standalone Mode. Spawning proper Worker...');
        if (!options.workerUrl) throw new Error('Worker URL required for Standalone Mode');

        // Fetch/Blob dance to bypass origin restrictions
        const response = await fetch(options.workerUrl);
        const code = await response.text();
        const blob = new Blob([code], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);

        const worker = new Worker(blobUrl);
        worker.onmessage = handleEngineMessage;
        setEnginePort(worker);

        // Send relay config if provided
        if (options.relays && options.relays.length > 0) {
            console.log('[Bridge] Sending relay config:', options.relays);
            worker.postMessage({
                type: 'RELAY_CONFIG',
                id: crypto.randomUUID(),
                action: 'SET',
                relays: options.relays
            });
        }

        // Send pubkey if provided
        if (options.publicKey) {
            console.log('[Bridge] Sending pubkey:', options.publicKey.slice(0, 8) + '...');
            worker.postMessage({
                type: 'SET_PUBKEY',
                id: crypto.randomUUID(),
                pubkey: options.publicKey
            });
        }
    }

    // 2. Install Polyfills & Interceptors
    (window as any).EventSource = MirageEventSource as any;

    // Register fetch stub callback
    if (typeof (window as any).__mirageBridgeReady === 'function') {
        (window as any).__mirageBridgeReady(interceptedFetch);
    } else {
        (window as { fetch: typeof interceptedFetch }).fetch = interceptedFetch;
    }

    // 3. Signal Ready
    signalEngineReady();
    console.log('[Bridge] Initialized & Ready');

    // In Child Mode, tell parent we are ready so it can send config
    if (isChildMode) {
        window.parent.postMessage({ type: 'BRIDGE_READY' }, '*');
    }
}

/**
 * Destroy the bridge and cleanup resources
 */
export function destroyBridge(): void {
    const port = enginePort;
    if (!isChildMode && port instanceof Worker) {
        port.terminate();
    }
    setEnginePort(null);
    window.fetch = originalFetch;
    pendingRequests.clear();
    activeStreams.clear();
    window.removeEventListener('message', handleEngineMessage);
}

// Re-export for external use
export { MirageEventSource };
