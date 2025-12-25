/**
 * Mirage Bridge - Entry Point
 *
 * Monkey-patches window.fetch to intercept /mirage/ calls.
 * Routes requests to either a Web Worker (Standalone Mode) or Parent Window (Child Mode).
 * Implements Virtual SSE for real-time streaming.
 */

import { nip19 } from 'nostr-tools';
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
    /**
     * User's private key (Standalone Mode).
     * If provided, Bridge will perform signing/encryption locally using nostr-tools.
     */
    privateKey?: string;

    /**
     * User's public key (Standalone Mode)
     */
    publicKey?: string;
}

import { getPublicKey } from 'nostr-tools';
import { setPrivateKey } from './messaging';

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
        // ... Child Mode ...
        console.log('[Bridge] Detected Child Mode. Connecting to Parent Host...');
        setChildMode(true);
        setEnginePort(window.parent);
        window.addEventListener('message', handleEngineMessage);
    } else {
        // ... Standalone Mode ...
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

        // Configure Local Signer if private key provided
        let effectivePubkey = options.publicKey;

        if (options.privateKey) {
            setPrivateKey(options.privateKey);
            // Derive public key if not explicitly given
            if (!effectivePubkey) {
                try {
                    // Need to import hexToBytes helper or rely on nostr-tools handling hex string
                    // nostr-tools v2 getPublicKey expects bytes usually.
                    // But we used a helper in messaging.ts. 
                    // Let's rely on messaging.ts having set the key?
                    // Actually, let's keep it simple: 
                    // We only set SET_PUBKEY message here.
                    // We can re-derive it or trust the user.
                    // Let's implement simple hex conversion here too or import it.
                    // Wait, getPublicKey is imported from nostr-tools at top.
                    // It needs bytes.
                    const bytes = new Uint8Array(options.privateKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
                    effectivePubkey = getPublicKey(bytes);
                } catch (e) {
                    console.error('[Bridge] Failed to derive pubkey from privacy key:', e);
                }
            }
        }

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

        // Send pubkey if provided or derived
        if (effectivePubkey) {
            let hexKey = effectivePubkey;
            // Check for npub and convert if needed
            if (hexKey.startsWith('npub')) {
                try {
                    console.log('[Bridge] Converting npub to hex...');
                    const decoded = nip19.decode(hexKey);
                    if (decoded.type === 'npub') {
                        hexKey = decoded.data;
                    }
                } catch (e) {
                    console.error('[Bridge] Failed to decode npub:', e);
                }
            }

            console.log('[Bridge] Sending pubkey:', hexKey.slice(0, 8) + '...');
            worker.postMessage({
                type: 'SET_PUBKEY',
                id: crypto.randomUUID(),
                pubkey: hexKey
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
