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
} from "@mirage/core";
import { Signer } from "./signer";
import { parsePermissions, isPathAllowed } from "./permissions";

// ============================================================================
// Allowed External URLs for CSP
// Add new URL prefixes here to allow apps to access additional resources
// ============================================================================

const ALLOWED_EXTERNAL_URLS = [
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/",
    "https://fonts.googleapis.com/",
    "https://fonts.gstatic.com/",
];

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
    private pendingInternalRequests = new Map<
        string,
        { resolve: (val: any) => void; reject: (err: any) => void }
    >();
    private listeners: Record<string, ((event: any) => void)[]> = {};

    constructor(config: MirageHostConfig) {
        this.config = config;
        this.signer = new Signer(config.signer);
        this.relays = [...config.relays];

        // Spawn Engine Worker immediately (Host owns the engine)
        console.log("[Host] Spawning Engine Worker:", config.engineUrl);
        // Create worker from blob to bypass origin restrictions if needed, or direct URL
        this.engineWorker = new Worker(config.engineUrl);

        // Listen for messages from the Engine
        this.engineWorker.onmessage = this.handleEngineMessage.bind(this);
        this.engineWorker.onerror = (err) =>
            console.error("[Host] Engine Worker Error:", err);

        // Listen for messages from the iframe
        window.addEventListener("message", this.handleAppMessage.bind(this));

        // Initialize Engine with relays
        this.sendRelayConfig("SET", this.relays);
    }

    // ==========================================================================
    // Event Management
    // ==========================================================================

    on(event: string, callback: (data: any) => void): void {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    off(event: string, callback: (data: any) => void): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    private emit(event: string, data: any): void {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
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
            this.sendRelayConfig("ADD", [url]);
        }
    }

    /**
     * Remove a relay from the pool
     */
    removeRelay(url: string): void {
        const index = this.relays.indexOf(url);
        if (index !== -1) {
            this.relays.splice(index, 1);
            this.sendRelayConfig("REMOVE", [url]);
        }
    }

    /**
     * Get current relay list
     */
    getRelays(): string[] {
        return [...this.relays];
    }

    /**
     * Get connection status for all active relays
     */
    async getRelayStats(): Promise<any[]> {
        const result = await this.sendToEngine({
            type: "ACTION_GET_RELAY_STATUS",
            id: crypto.randomUUID(),
        });
        return (result as any).stats;
    }

    /**
     * Set the current pubkey on the Engine for authenticated API requests.
     * This should be called after getting the pubkey from the signer.
     */
    setPubkey(pubkey: string): void {
        console.log("[Host] Setting pubkey on engine:", pubkey.slice(0, 8) + "...");
        this.engineWorker.postMessage({
            type: "SET_PUBKEY",
            id: crypto.randomUUID(),
            pubkey,
        });
    }

    private sendRelayConfig(
        action: "SET" | "ADD" | "REMOVE",
        relays: string[],
    ): void {
        const message: RelayConfigMessage = {
            type: "RELAY_CONFIG",
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
    async mount(
        appHtml: string,
        container: HTMLElement,
        options?: {
            appId?: string;
            spaceId?: string;
            spaceName?: string;
        }
    ): Promise<void> {
        const appId = options?.appId;

        // Parse permissions from app HTML
        this.appPermissions = parsePermissions(appHtml);
        console.log("[Host] App permissions:", this.appPermissions.permissions);

        // Create sandboxed iframe
        this.iframe = document.createElement("iframe");
        this.iframe.sandbox.add("allow-scripts");
        this.iframe.sandbox.add("allow-forms");
        this.iframe.sandbox.add("allow-modals");
        this.iframe.style.width = "100%";
        this.iframe.style.height = "100%";
        this.iframe.style.border = "none";

        // Inject the bridge script into the app HTML
        const injectedHtml = this.injectBridge(appHtml);

        // Use srcdoc to load the app (forces null origin)
        this.iframe.srcdoc = injectedHtml;

        // Mount to container
        container.innerHTML = "";
        container.appendChild(this.iframe);

        // Wait for bridge to signal it's ready
        await new Promise<void>((resolve) => {
            const handleReady = async (event: MessageEvent) => {
                if (
                    event.source === this.iframe?.contentWindow &&
                    event.data?.type === "BRIDGE_READY"
                ) {
                    window.removeEventListener("message", handleReady);
                    console.log("[Host] Bridge ready");

                    // Set app origin for space scoping
                    if (appId) {
                        console.log(
                            "[Host] Setting app origin:",
                            appId.slice(0, 20) + "...",
                        );

                        // Send to Engine (for relay operations)
                        this.engineWorker.postMessage({
                            type: "SET_APP_ORIGIN",
                            id: crypto.randomUUID(),
                            origin: appId,
                        });

                        // Send to Bridge/Iframe (for preview mode detection)
                        this.iframe?.contentWindow?.postMessage(
                            {
                                type: "SET_APP_ORIGIN",
                                origin: appId,
                            },
                            "*",
                        );
                    }

                    // Set space context if provided
                    if (options?.spaceId) {
                        console.log(
                            "[Host] Setting space context:",
                            options.spaceId,
                        );
                        const spaceMsg = {
                            type: "SET_SPACE_CONTEXT",
                            id: crypto.randomUUID(),
                            spaceId: options.spaceId,
                            spaceName: options.spaceName || "",
                        };
                        this.engineWorker.postMessage(spaceMsg);
                        this.iframe?.contentWindow?.postMessage(spaceMsg, "*");
                    }

                    resolve();
                }
            };
            window.addEventListener("message", handleReady);
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

    // ==========================================================================
    // Space Management
    // ==========================================================================

    /**
     * Create a new space
     */
    async createSpace(name: string, appId?: string): Promise<any> {
        return this.request("POST", "/mirage/v1/spaces", { name, appOrigin: appId });
    }

    /**
     * List user's spaces
     */
    async listSpaces(): Promise<any[]> {
        return this.request("GET", "/mirage/v1/spaces");
    }

    /**
     * Get details for a specific space
     */
    async getSpace(id: string): Promise<any> {
        return this.request("GET", `/mirage/v1/spaces/${id}`);
    }

    /**
     * Delete a space
     */
    async deleteSpace(id: string): Promise<void> {
        return this.request("DELETE", `/mirage/v1/spaces/${id}`);
    }

    /**
     * Invite a user to a space
     */
    async inviteToSpace(spaceId: string, pubkey: string, spaceName?: string): Promise<void> {
        console.log(`[InviteDebug] host.inviteToSpace(spaceId=${spaceId}, pubkey=${pubkey.slice(0, 10)}..., name=${spaceName})`);
        return this.request("POST", `/mirage/v1/spaces/${spaceId}/invite`, { pubkey, name: spaceName });
    }

    /**
     * Fetch an app's HTML code from Nostr relays
     */
    async fetchApp(naddr: string): Promise<string | null> {
        return this.sendToEngine({
            type: "ACTION_FETCH_APP",
            id: crypto.randomUUID(),
            naddr,
        });
    }

    /**
     * Send an API request to the Engine
     */
    async request(
        method: "GET" | "POST" | "PUT" | "DELETE",
        path: string,
        body?: unknown,
    ): Promise<any> {
        if (path.includes('/invite')) {
            console.log(`[InviteDebug] host.request: ${method} ${path}`);
        }
        return this.sendToEngine({
            type: "API_REQUEST",
            id: crypto.randomUUID(),
            method,
            path,
            body,
        });
    }

    /**
     * Send a message to the Engine and wait for a response
     */
    async sendToEngine(message: any): Promise<any> {
        const start = performance.now();
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (this.pendingInternalRequests.has(message.id)) {
                    this.pendingInternalRequests.delete(message.id);
                    reject(
                        new Error(`Engine request timed out after 15s: ${message.type}`),
                    );
                }
            }, 15000);

            this.pendingInternalRequests.set(message.id, {
                resolve: (val) => {
                    clearTimeout(timeout);
                    const duration = performance.now() - start;
                    if (duration > 100) {
                        console.log(
                            `[MirageHost] SLOW REQUEST: ${message.type} ${message.path || ""} took ${duration.toFixed(2)}ms`,
                        );
                    }
                    resolve(val);
                },
                reject: (err) => {
                    clearTimeout(timeout);
                    reject(err);
                },
            });
            this.engineWorker.postMessage(message);
        });
    }

    private injectBridge(html: string): string {
        // Content Security Policy MUST be injected first to take effect
        // before any other content is parsed
        const cspMeta = this.buildCspMeta();

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

        // CSP must be the FIRST thing in the document to be effective.
        // We prepend it before everything else regardless of document structure.
        // Then inject bridge scripts in <head> or fallback locations.
        const htmlWithCsp = cspMeta + html;

        // Try to inject bridge scripts at end of <head>
        if (htmlWithCsp.includes("</head>")) {
            return htmlWithCsp.replace(
                "</head>",
                fetchStubScript + bridgeScript + "</head>",
            );
        }

        // Otherwise inject at start of <body>
        if (htmlWithCsp.includes("<body>")) {
            return htmlWithCsp.replace(
                "<body>",
                "<body>" + fetchStubScript + bridgeScript,
            );
        }

        // Fallback: append scripts after CSP
        return cspMeta + fetchStubScript + bridgeScript + html;
    }

    /**
     * Build Content Security Policy meta tag from allowed URLs list
     * The CSP restricts what external resources the sandboxed app can load
     */
    private buildCspMeta(): string {
        // Build URL lists for each directive
        const styleUrls = ALLOWED_EXTERNAL_URLS.join(" ");
        const fontUrls = ALLOWED_EXTERNAL_URLS.join(" ");

        // Need to allow connecting to the bridge URL host
        // Extract origin from bridge URL (e.g., http://localhost:5173 or the deployed origin)
        let bridgeOrigin = "";
        try {
            const url = new URL(this.config.bridgeUrl, window.location.origin);
            bridgeOrigin = url.origin;
        } catch {
            // If relative URL, allow the current origin
            bridgeOrigin = window.location.origin;
        }

        // CSP for srcdoc iframes:
        // - 'unsafe-inline' is ONLY valid for script-src and style-src, NOT default-src
        // - srcdoc iframes have null origin, so 'self' doesn't work
        // - We use a permissive default-src but restrict connect-src to control fetch
        // - This allows the app to render while blocking arbitrary external requests
        const csp = [
            "default-src * blob: data:",                                    // Allow most content
            "script-src 'unsafe-inline' 'unsafe-eval' blob:",               // Allow inline scripts + blob
            `style-src 'unsafe-inline' * ${styleUrls}`,                     // Allow inline styles + external
            `font-src * data: ${fontUrls}`,                                 // Allow fonts
            `img-src * blob: data:`,                                        // Allow images from anywhere
            `connect-src blob: ${bridgeOrigin}`,                            // RESTRICT: only bridge origin
            "frame-src blob: data:",                                        // Allow blob/data frames
            "media-src * blob: data:",                                      // Allow media
        ].join("; ");

        return `<meta http-equiv="Content-Security-Policy" content="${csp}">`;
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
        if (message.type === "API_REQUEST") {
            // Check permissions here if needed
            this.engineWorker.postMessage(message);
        }
        // Route: STREAM_OPEN / STREAM_CLOSE from App -> Engine
        else if (
            message.type === "STREAM_OPEN" ||
            message.type === "STREAM_CLOSE"
        ) {
            this.engineWorker.postMessage(message);
        }
        // Route: ACTION_SIGN_EVENT from App -> Host (handled here)
        else if (message.type === "ACTION_SIGN_EVENT") {
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
                if (message.type === "ERROR" || (message as any).error) {
                    pending.reject(new Error((message as any).error || "Unknown error"));
                } else {
                    // Handle different message types
                    if (message.type === "API_RESPONSE") {
                        pending.resolve((message as any).body);
                    } else if (message.type === "FETCH_APP_RESULT") {
                        pending.resolve((message as any).html);
                    } else {
                        pending.resolve(message);
                    }
                }
            }
            return;
        }

        // Route: API_RESPONSE from Engine -> App
        if (message.type === "API_RESPONSE") {
            this.postToIframe(message);
        }
        // Route: ACTION_SIGN_EVENT from Engine -> Host (Engine needs us to sign)
        else if (message.type === "ACTION_SIGN_EVENT") {
            this.handleSignRequest(message as SignEventMessage, true);
        }
        // Route: ACTION_ENCRYPT from Engine -> Host (NIP-44 encryption)
        else if (message.type === "ACTION_ENCRYPT") {
            this.handleEncryptRequest(message as any);
        }
        // Route: ACTION_DECRYPT from Engine -> Host (NIP-44 decryption)
        else if (message.type === "ACTION_DECRYPT") {
            this.handleDecryptRequest(message as any);
        }
        // Route: Streaming messages from Engine -> App
        else if (
            message.type === "STREAM_CHUNK" ||
            message.type === "STREAM_CLOSE" ||
            message.type === "STREAM_ERROR"
        ) {
            this.postToIframe(message);
        }
        // Route: New Space Invite Notification
        else if (message.type === "NEW_SPACE_INVITE") {
            console.log(`[InviteDebug] Host received NEW_SPACE_INVITE for: ${(message as any).spaceName || (message as any).spaceId}`);
            this.emit("new_space_invite", message);
        }
    }

    private async handleEncryptRequest(message: {
        id: string;
        pubkey: string;
        plaintext: string;
    }): Promise<void> {
        try {
            if (!this.signer.isAvailable()) {
                this.engineWorker.postMessage({
                    type: "ENCRYPT_RESULT",
                    id: message.id,
                    error: "No signer available",
                });
                return;
            }

            // Use NIP-44 encryption via signer
            const ciphertext = await this.signer.encrypt(
                message.pubkey,
                message.plaintext,
            );

            this.engineWorker.postMessage({
                type: "ENCRYPT_RESULT",
                id: message.id,
                ciphertext,
            });
        } catch (error) {
            this.engineWorker.postMessage({
                type: "ENCRYPT_RESULT",
                id: message.id,
                error: error instanceof Error ? error.message : "Encryption failed",
            });
        }
    }

    private async handleDecryptRequest(message: {
        id: string;
        pubkey: string;
        ciphertext: string;
    }): Promise<void> {
        try {
            if (!this.signer.isAvailable()) {
                this.engineWorker.postMessage({
                    type: "DECRYPT_RESULT",
                    id: message.id,
                    error: "No signer available",
                });
                return;
            }

            // Use NIP-44 decryption via signer
            const plaintext = await this.signer.decrypt(
                message.pubkey,
                message.ciphertext,
            );

            this.engineWorker.postMessage({
                type: "DECRYPT_RESULT",
                id: message.id,
                plaintext,
            });
        } catch (error) {
            this.engineWorker.postMessage({
                type: "DECRYPT_RESULT",
                id: message.id,
                error: error instanceof Error ? error.message : "Decryption failed",
            });
        }
    }

    private async handleSignRequest(
        message: SignEventMessage,
        fromEngine = false,
    ): Promise<void> {
        try {
            // Check if signer is available
            if (!this.signer.isAvailable()) {
                const errorMsg = {
                    type: "SIGNATURE_RESULT",
                    id: message.id,
                    error: "No signer available",
                };
                fromEngine
                    ? this.engineWorker.postMessage(errorMsg)
                    : this.postToIframe(errorMsg as any);
                return;
            }

            // Sign the event
            const signedEvent = await this.signer.signEvent(message.event);

            // Send result back
            const resultMsg = {
                type: "SIGNATURE_RESULT",
                id: message.id,
                signedEvent,
            };
            fromEngine
                ? this.engineWorker.postMessage(resultMsg)
                : this.postToIframe(resultMsg as any);
        } catch (error) {
            const errorMsg = {
                type: "SIGNATURE_RESULT",
                id: message.id,
                error: error instanceof Error ? error.message : "Signing failed",
            };
            fromEngine
                ? this.engineWorker.postMessage(errorMsg)
                : this.postToIframe(errorMsg as any);
        }
    }

    private postToIframe(message: MirageMessage): void {
        if (this.iframe?.contentWindow) {
            this.iframe.contentWindow.postMessage(message, "*");
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
        window.removeEventListener("message", this.handleAppMessage.bind(this));
        this.engineWorker.terminate();
    }
}

// Re-export utilities
export { parsePermissions, isPathAllowed } from "./permissions";
export { Signer } from "./signer";
