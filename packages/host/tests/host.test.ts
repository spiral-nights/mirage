import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { MirageHost } from "../src/index";

// Mock Window
if (typeof window === 'undefined') {
    (global as any).window = {
        addEventListener: () => { },
        removeEventListener: () => { },
        location: { origin: 'http://localhost' }
    };
}

// Mock Worker
class MockWorker {
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;

    constructor(url: string) { }

    postMessage(data: any) {
        // Echo back for testing
        if (this.onmessage) {
            // Simulate async response
            setTimeout(() => {
                if (data.type === 'ACTION_FETCH_APP') {
                    this.onmessage!({ data: { type: 'FETCH_APP_RESULT', id: data.id, html: '<html>App</html>' } } as MessageEvent);
                } else if (data.type === 'API_REQUEST') {
                    this.onmessage!({ data: { type: 'API_RESPONSE', id: data.id, status: 200, body: { success: true } } } as MessageEvent);
                } else if (data.type === 'RELAY_CONFIG') {
                    // ignore
                }
            }, 10);
        }
    }

    terminate() { }
}

// Override global Worker
global.Worker = MockWorker as any;

describe("MirageHost", () => {
    let host: MirageHost;

    beforeEach(() => {
        host = new MirageHost({
            relays: [],
            engineUrl: "engine.js",
            bridgeUrl: "bridge.js"
        });
    });

    afterEach(() => {
        if (host) host.destroy();
    });

    test("fetchApp sends message and receives result", async () => {
        const html = await host.fetchApp("naddr1...");
        expect(html).toBe("<html>App</html>");
    });

    test("request sends message and receives body", async () => {
        const result = await host.request("GET", "/test");
        expect(result).toEqual({ success: true });
    });
});