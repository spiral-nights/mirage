/**
 * @mirage/host
 *
 * The Mirage Host - Parent Controller
 *
 * Manages app sandboxing, relay configuration, and NIP-07 signing.
 */

import type {
    MirageMessage,
    SignEventMessage,
    RelayConfigMessage,
    Nip07Signer,
    AppPermissions,
} from '@mirage/core';
import { Signer } from './signer';
import { parsePermissions, isPathAllowed } from './permissions';

// ============================================================================
// Configuration
// ============================================================================

export interface MirageHostConfig {
    /** NIP-07 signer or browser extension */
    signer?: Nip07Signer;
    /** Initial relay URLs */
    relays: string[];
    /** URL to the engine worker script */
    engineUrl: string;
    /** URL to the bridge script to inject */
    bridgeUrl: string;
}

// ============================================================================
// MirageHost Class
// ============================================================================

export class MirageHost {
    private config: MirageHostConfig;
    private signer: Signer;
    private iframe: HTMLIFrameElement | null = null;
    private engineWorker: Worker;
    private appPermissions: AppPermissions = { permissions: [] };
    private relays: string[];
    private pendingInternalRequests = new Map<string, { resolve: (val: any) => void, reject: (err: any) => void }>();

    constructor(config: MirageHostConfig) {
        this.config = config;
        this.signer = new Signer(config.signer);
        this.relays = [...config.relays];

        // Spawn Engine Worker immediately (Host owns the engine)
        console.log('[Host] Spawning Engine Worker:', config.engineUrl);
        // Create worker from blob to bypass origin restrictions if needed, or direct URL
        this.engineWorker = new Worker(config.engineUrl);

        // Listen for messages from the Engine
        this.engineWorker.onmessage = this.handleEngineMessage.bind(this);
        this.engineWorker.onerror = (err) => console.error('[Host] Engine Worker Error:', err);

        // Listen for messages from the iframe
        window.addEventListener('message', this.handleAppMessage.bind(this));

        // Initialize Engine with relays
        this.sendRelayConfig('SET', this.relays);
    }

    // ==========================================================================
    // Relay Management
    // ==========================================================================

    /**
     * Add a relay to the pool
     */
    addRelay(url: string): void {
        if (!this.relays.includes(url)) {
            this.relays.push(url);
            this.sendRelayConfig('ADD', [url]);
        }
    }

    /**
     * Remove a relay from the pool
     */
    removeRelay(url: string): void {
        const index = this.relays.indexOf(url);
        if (index !== -1) {
            this.relays.splice(index, 1);
            this.sendRelayConfig('REMOVE', [url]);
        }
    }

    /**
     * Get current relay list
     */
    getRelays(): string[] {
        return [...this.relays];
    }

    /**
     * Set the current pubkey on the Engine for authenticated API requests.
     * This should be called after getting the pubkey from the signer.
     */
    setPubkey(pubkey: string): void {
        console.log('[Host] Setting pubkey on engine:', pubkey.slice(0, 8) + '...');
        this.engineWorker.postMessage({
            type: 'SET_PUBKEY',
            id: crypto.randomUUID(),
            pubkey,
        });
    }

    private sendRelayConfig(action: 'SET' | 'ADD' | 'REMOVE', relays: string[]): void {
        const message: RelayConfigMessage = {
            type: 'RELAY_CONFIG',
            id: crypto.randomUUID(),
            action,
            relays,
        };
        this.finalPostToEngine(message);
    }

    // ==========================================================================
    // App Mounting
    // ==========================================================================

    /**
     * Mount an app into a container element
     */
    async mount(appHtml: string, container: HTMLElement, appId?: string): Promise<void> {
        // Parse permissions from app HTML
        this.appPermissions = parsePermissions(appHtml);
        console.log('[Host] App permissions:', this.appPermissions.permissions);

        // Create sandboxed iframe
        this.iframe = document.createElement('iframe');
        this.iframe.sandbox.add('allow-scripts');
        this.iframe.sandbox.add('allow-forms');
        this.iframe.sandbox.add('allow-modals');
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';
        this.iframe.style.border = 'none';

        // Inject the bridge script into the app HTML
        const injectedHtml = this.injectBridge(appHtml);

        // Use srcdoc to load the app (forces null origin)
        this.iframe.srcdoc = injectedHtml;

        // Mount to container
        container.innerHTML = '';
        container.appendChild(this.iframe);

        // Wait for bridge to signal it's ready
        await new Promise<void>((resolve) => {
            const handleReady = async (event: MessageEvent) => {
                if (event.source === this.iframe?.contentWindow && event.data?.type === 'BRIDGE_READY') {
                    window.removeEventListener('message', handleReady);
                    console.log('[Host] Bridge ready');

                    // Set app origin for space scoping
                    if (appId) {
                        console.log('[Host] Setting app origin:', appId.slice(0, 20) + '...');
                        this.engineWorker.postMessage({
                            type: 'SET_APP_ORIGIN',
                            id: crypto.randomUUID(),
                            origin: appId,
                        });
                    }

                    // Send user pubkey if signer is available
                    if (this.signer.isAvailable()) {
                        try {
                            const pubkey = await this.signer.getPublicKey();
                            console.log('[Host] Sending pubkey to engine:', pubkey.slice(0, 8) + '...');
                            this.engineWorker.postMessage({
                                type: 'SET_PUBKEY',
                                id: crypto.randomUUID(),
                                pubkey,
                            });
                        } catch (err) {
                            console.warn('[Host] Could not get pubkey from signer:', err);
                        }
                    }

                    resolve();
                }
            };
            window.addEventListener('message', handleReady);
        });
    }

    /**
     * Unmount the current app
     */
    unmount(): void {
        if (this.iframe) {
            this.iframe.remove();
            this.iframe = null;
        }
        this.appPermissions = { permissions: [] };
    }

    /**
     * Fetch an app's HTML code from Nostr relays
     */
    async fetchApp(naddr: string): Promise<string | null> {
        return this.sendToEngine({
            type: 'ACTION_FETCH_APP',
            id: crypto.randomUUID(),
            naddr
        });
    }

    /**
     * Send an API request to the Engine
     */
    async request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<any> {
        return this.sendToEngine({
            type: 'API_REQUEST',
            id: crypto.randomUUID(),
            method,
            path,
            body
        });
    }

    /**
     * Send a message to the Engine and wait for a response
     */
    async sendToEngine(message: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pendingInternalRequests.set(message.id, { resolve, reject });
            this.engineWorker.postMessage(message);
        });
    }

    private injectBridge(html: string): string {
        // Two-phase bridge injection:
        // 1. Immediate synchronous stub that patches fetch and queues /mirage/ requests
        // 2. Async module that loads the actual bridge and processes queued requests

        const fetchStubScript = `
      <script>
        // Immediately patch fetch to queue /mirage/ requests
        (function() {
          const originalFetch = window.fetch.bind(window);
          const pendingQueue = [];
          let bridgeReady = false;
          let resolveReady;
          const bridgeReadyPromise = new Promise(r => resolveReady = r);
          
          window.fetch = function(input, init) {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            if (!url.startsWith('/mirage/')) {
              return originalFetch(input, init);
            }
            // Queue mirage requests until bridge is ready
            return bridgeReadyPromise.then(() => window.fetch(input, init));
          };
          
          // Expose ready signal for bridge to call
          window.__mirageBridgeReady = function(newFetch) {
            window.fetch = newFetch;
            bridgeReady = true;
            resolveReady();
          };
        })();
      </script>
    `;

        const bridgeScript = `
      <script type="module">
        console.log('[Bridge Loader] Fetching bridge...');
        try {
          const bridgeResponse = await fetch('${this.config.bridgeUrl}');
          if (!bridgeResponse.ok) throw new Error('Failed to load bridge: ' + bridgeResponse.status);
          const bridgeCode = await bridgeResponse.text();
          const bridgeBlob = new Blob([bridgeCode], { type: 'application/javascript' });
          const bridgeUrl = URL.createObjectURL(bridgeBlob);
          
          const { initBridge } = await import(bridgeUrl);
          console.log('[Bridge Loader] Bridge loaded, initializing...');
          // Host mode: we don't pass workerUrl because Host owns the worker
          await initBridge({ workerUrl: '' });
          console.log('[Bridge Loader] Bridge initialized!');
        } catch (err) {
          console.error('[Bridge Loader] Error:', err);
        }
      </script>
    `;

        // Try to inject in <head> - stub must come first!
        if (html.includes('</head>')) {
            return html.replace('</head>', fetchStubScript + bridgeScript + '</head>');
        }

        // Otherwise inject at start of <body>
        if (html.includes('<body>')) {
            return html.replace('<body>', '<body>' + fetchStubScript + bridgeScript);
        }

        // Fallback: prepend to HTML
        return fetchStubScript + bridgeScript + html;
    }

    // ==========================================================================
    // Message Handling (Router)
    // ==========================================================================

    private handleAppMessage(event: MessageEvent<MirageMessage>): void {
        // Only accept messages from our iframe
        if (this.iframe && event.source !== this.iframe.contentWindow) {
            return;
        }

        const message = event.data;

        // Route: API_REQUEST from App -> Engine
        if (message.type === 'API_REQUEST') {
            // Check permissions here if needed
            this.engineWorker.postMessage(message);
        }
        // Route: STREAM_OPEN / STREAM_CLOSE from App -> Engine
        else if (message.type === 'STREAM_OPEN' || message.type === 'STREAM_CLOSE') {
            this.engineWorker.postMessage(message);
        }
        // Route: ACTION_SIGN_EVENT from App -> Host (handled here)
        else if (message.type === 'ACTION_SIGN_EVENT') {
            // Forward sign requests to Engine, which will then ask Host to sign? 
            // Actually, API needs to ask for signing. 
            // In new architecture, Engine handles everything. If Engine needs signature, it asks Host.
            // Wait, the API spec says `security: nip07`. The Engine might need to sign.
            // Let's forward SIGN actions to Host directly if they come from Bridge, 
            // BUT normally Bridge sends API_REQUEST, Engine processes, then Engine asks Host to sign.
            // Let's assume standard API flow: App -> Bridge -> Engine.
            // If Engine needs signature, it sends ACTION_SIGN_EVENT to Host.
            // Does App sends ACTION_SIGN_EVENT directly? Only if using `window.nostr`.
            // If using `fetch`, App sends API_REQUEST.
            // Does local shim support window.nostr?

            // For now, let's assume we handle SIGN requests if they come from the App (shim)
            this.handleSignRequest(message as SignEventMessage);
        }
    }

    private handleEngineMessage(event: MessageEvent<MirageMessage>): void {
        const message = event.data;

        // Check if this is a response to an internal Host request
        if (message.id && this.pendingInternalRequests.has(message.id)) {
            const pending = this.pendingInternalRequests.get(message.id);
            if (pending) {
                this.pendingInternalRequests.delete(message.id);
                if (message.type === 'ERROR' || (message as any).error) {
                    pending.reject(new Error((message as any).error || 'Unknown error'));
                } else {
                    // Handle different message types
                    if (message.type === 'API_RESPONSE') {
                        pending.resolve((message as any).body);
                    } else if (message.type === 'FETCH_APP_RESULT') {
                        pending.resolve((message as any).html);
                    } else {
                        pending.resolve(message);
                    }
                }
            }
            return;
        }

        // Route: API_RESPONSE from Engine -> App
        if (message.type === 'API_RESPONSE') {
            this.postToIframe(message);
        }
        // Route: ACTION_SIGN_EVENT from Engine -> Host (Engine needs us to sign)
        else if (message.type === 'ACTION_SIGN_EVENT') {
            this.handleSignRequest(message as SignEventMessage, true);
        }
        // Route: ACTION_ENCRYPT from Engine -> Host (NIP-44 encryption)
        else if (message.type === 'ACTION_ENCRYPT') {
            this.handleEncryptRequest(message as any);
        }
        // Route: ACTION_DECRYPT from Engine -> Host (NIP-44 decryption)
        else if (message.type === 'ACTION_DECRYPT') {
            this.handleDecryptRequest(message as any);
        }
        // Route: Streaming messages from Engine -> App
        else if (message.type === 'STREAM_CHUNK' || message.type === 'STREAM_CLOSE' || message.type === 'STREAM_ERROR') {
            this.postToIframe(message);
        }
    }

    private async handleEncryptRequest(message: { id: string; pubkey: string; plaintext: string }): Promise<void> {
        try {
            if (!this.signer.isAvailable()) {
                this.engineWorker.postMessage({
                    type: 'ENCRYPT_RESULT',
                    id: message.id,
                    error: 'No signer available',
                });
                return;
            }

            // Use NIP-44 encryption via signer
            const ciphertext = await this.signer.encrypt(message.pubkey, message.plaintext);

            this.engineWorker.postMessage({
                type: 'ENCRYPT_RESULT',
                id: message.id,
                ciphertext,
            });
        } catch (error) {
            this.engineWorker.postMessage({
                type: 'ENCRYPT_RESULT',
                id: message.id,
                error: error instanceof Error ? error.message : 'Encryption failed',
            });
        }
    }

    private async handleDecryptRequest(message: { id: string; pubkey: string; ciphertext: string }): Promise<void> {
        try {
            if (!this.signer.isAvailable()) {
                this.engineWorker.postMessage({
                    type: 'DECRYPT_RESULT',
                    id: message.id,
                    error: 'No signer available',
                });
                return;
            }

            // Use NIP-44 decryption via signer
            const plaintext = await this.signer.decrypt(message.pubkey, message.ciphertext);

            this.engineWorker.postMessage({
                type: 'DECRYPT_RESULT',
                id: message.id,
                plaintext,
            });
        } catch (error) {
            this.engineWorker.postMessage({
                type: 'DECRYPT_RESULT',
                id: message.id,
                error: error instanceof Error ? error.message : 'Decryption failed',
            });
        }
    }

    private async handleSignRequest(message: SignEventMessage, fromEngine = false): Promise<void> {
        try {
            // Check if signer is available
            if (!this.signer.isAvailable()) {
                const errorMsg = {
                    type: 'SIGNATURE_RESULT',
                    id: message.id,
                    error: 'No signer available',
                };
                fromEngine ? this.engineWorker.postMessage(errorMsg) : this.postToIframe(errorMsg as any);
                return;
            }

            // Sign the event
            const signedEvent = await this.signer.signEvent(message.event);

            // Send result back
            const resultMsg = {
                type: 'SIGNATURE_RESULT',
                id: message.id,
                signedEvent,
            };
            fromEngine ? this.engineWorker.postMessage(resultMsg) : this.postToIframe(resultMsg as any);

        } catch (error) {
            const errorMsg = {
                type: 'SIGNATURE_RESULT',
                id: message.id,
                error: error instanceof Error ? error.message : 'Signing failed',
            };
            fromEngine ? this.engineWorker.postMessage(errorMsg) : this.postToIframe(errorMsg as any);
        }
    }

    private postToIframe(message: MirageMessage): void {
        if (this.iframe?.contentWindow) {
            this.iframe.contentWindow.postMessage(message, '*');
        }
    }

    private finalPostToEngine(message: MirageMessage): void {
        this.engineWorker.postMessage(message);
    }

    // ==========================================================================
    // Cleanup
    // ==========================================================================

    /**
     * Destroy the host and cleanup resources
     */
    destroy(): void {
        this.unmount();
        window.removeEventListener('message', this.handleAppMessage.bind(this));
        this.engineWorker.terminate();
    }
}

// Re-export utilities
export { parsePermissions, isPathAllowed } from './permissions';
export { Signer } from './signer';
