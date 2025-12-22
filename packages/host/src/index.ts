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
    private appPermissions: AppPermissions = { permissions: [] };
    private relays: string[];

    constructor(config: MirageHostConfig) {
        this.config = config;
        this.signer = new Signer(config.signer);
        this.relays = [...config.relays];

        // Listen for messages from the iframe
        window.addEventListener('message', this.handleMessage.bind(this));
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

    private sendRelayConfig(action: 'SET' | 'ADD' | 'REMOVE', relays: string[]): void {
        const message: RelayConfigMessage = {
            type: 'RELAY_CONFIG',
            id: crypto.randomUUID(),
            action,
            relays,
        };
        this.postToIframe(message);
    }

    // ==========================================================================
    // App Mounting
    // ==========================================================================

    /**
     * Mount an app into a container element
     */
    async mount(appHtml: string, container: HTMLElement): Promise<void> {
        // Parse permissions from app HTML
        this.appPermissions = parsePermissions(appHtml);
        console.log('[Host] App permissions:', this.appPermissions.permissions);

        // Create sandboxed iframe
        this.iframe = document.createElement('iframe');
        this.iframe.sandbox.add('allow-scripts');
        this.iframe.sandbox.add('allow-forms');
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
                    console.log('[Host] Bridge ready, sending relay config');
                    this.sendRelayConfig('SET', this.relays);

                    // Send user pubkey if signer is available
                    if (this.signer.isAvailable()) {
                        try {
                            const pubkey = await this.signer.getPublicKey();
                            console.log('[Host] Sending pubkey to engine:', pubkey.slice(0, 8) + '...');
                            this.postToIframe({
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
          await initBridge({ workerUrl: '${this.config.engineUrl}' });
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
    // Message Handling
    // ==========================================================================

    private handleMessage(event: MessageEvent<MirageMessage>): void {
        // Only accept messages from our iframe
        if (this.iframe && event.source !== this.iframe.contentWindow) {
            return;
        }

        const message = event.data;

        if (message.type === 'ACTION_SIGN_EVENT') {
            this.handleSignRequest(message);
        }
    }

    private async handleSignRequest(message: SignEventMessage): Promise<void> {
        try {
            // Check if signer is available
            if (!this.signer.isAvailable()) {
                this.postToIframe({
                    type: 'SIGNATURE_RESULT',
                    id: message.id,
                    error: 'No signer available',
                });
                return;
            }

            // Sign the event
            const signedEvent = await this.signer.signEvent(message.event);

            // Send full signed event back to iframe
            this.postToIframe({
                type: 'SIGNATURE_RESULT',
                id: message.id,
                signedEvent,
            });
        } catch (error) {
            this.postToIframe({
                type: 'SIGNATURE_RESULT',
                id: message.id,
                error: error instanceof Error ? error.message : 'Signing failed',
            });
        }
    }

    private postToIframe(message: MirageMessage): void {
        if (this.iframe?.contentWindow) {
            this.iframe.contentWindow.postMessage(message, '*');
        }
    }

    // ==========================================================================
    // Cleanup
    // ==========================================================================

    /**
     * Destroy the host and cleanup resources
     */
    destroy(): void {
        this.unmount();
        window.removeEventListener('message', this.handleMessage.bind(this));
    }
}

// Re-export utilities
export { parsePermissions, isPathAllowed } from './permissions';
export { Signer } from './signer';
