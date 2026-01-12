import { describe, test, expect, mock, beforeEach } from "bun:test";
import { SimplePool } from "nostr-tools";

// Mocks removed to prevent side effects


// Mock nostr-tools
const mockGet = mock();
const mockPublish = mock((_: any[], __: any) => [Promise.resolve()]);
const mockDecode = mock((s: string) => {
    if (s === "invalid") throw new Error("Invalid");
    return { type: "naddr", data: { kind: 30078, pubkey: "pk", identifier: "app" } };
});

mock.module("nostr-tools", () => ({
    SimplePool: class {
        get = mockGet;
        publish = mockPublish;
    },
    nip19: {
        decode: mockDecode
    }
}));

// Import AppService after mocks
import { AppService } from "../src/engine/services/AppService";

describe("AppService", () => {
    let service: AppService;
    let mockPool: any;
    const mockSign = mock(async (e: any) => e);
    const mockEncrypt = mock(async (_: string, p: string) => p);
    const mockDecrypt = mock(async (_: string, c: string) => c);

    beforeEach(() => {
        mockGet.mockClear();
        mockPublish.mockClear();
        mockDecode.mockClear();

        mockPool = {
            get: mockGet,
            publish: mockPublish,
        };
        service = new AppService(
            mockPool,
            ["wss://relay.test"],
            mockSign,
            mockEncrypt,
            mockDecrypt,
            "my-pubkey",
            "mirage"
        );
    });

    test("fetchAppCode successfully returns content", async () => {
        mockGet.mockResolvedValue({ content: "<html>App</html>" });

        const result = await service.fetchAppCode("naddr1valid");

        expect(result.html).toBe("<html>App</html>");
        expect(mockGet).toHaveBeenCalled();
        expect(mockDecode).toHaveBeenCalledWith("naddr1valid");
    });

    test("fetchAppCode handles missing app", async () => {
        mockGet.mockResolvedValue(null);

        const result = await service.fetchAppCode("naddr1valid");

        expect(result.error).toBe("App not found on relays");
    });

    test("listApps retrieves from storage", async () => {
        const apps = [{ name: "Test App", naddr: "naddr1test", createdAt: 100 }];
        // internalGetStorage calls pool.get
        // We need to return an event with content
        mockGet.mockResolvedValue({
            content: JSON.stringify(apps)
        });

        const result = await service.listApps();

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Test App");
        expect(mockGet).toHaveBeenCalled();
    });

    test("listApps handles empty storage", async () => {
        mockGet.mockResolvedValue(null);

        const result = await service.listApps();

        expect(result).toEqual([]);
    });

    test("addApp adds to library and saves", async () => {
        // Initial load returns empty
        mockGet.mockResolvedValue(null);

        const newApp = { name: "New App", naddr: "naddr1new", createdAt: 123 };
        await service.addApp(newApp);

        expect(mockGet).toHaveBeenCalled(); // Loads library
        expect(mockPublish).toHaveBeenCalled(); // Saves updated

        // Verify publish args
        // pool.publish(relays, event)
        // internalPutStorage -> requestSign -> publish
        // We need to check the event content passed to publish
        const calls = mockPublish.mock.calls;
        // mockPublish returns [Promise], so calls[0] is [relays, event]
        const [relays, event] = calls[0];
        expect(JSON.parse(event.content)).toHaveLength(1);
        expect(JSON.parse(event.content)[0]).toEqual(newApp);
    });

    test("removeApp removes from library and publishes deletion", async () => {
        const apps = [{ name: "App 1", naddr: "naddr1", createdAt: 1 }, { name: "App 2", naddr: "naddr2", createdAt: 2 }];
        mockGet.mockResolvedValue({
            content: JSON.stringify(apps)
        });

        const removed = await service.removeApp("naddr1");

        expect(removed).toBe(true);
        expect(mockPublish).toHaveBeenCalled();

        // Check remaining apps
        // First publish is the update (internalPutStorage)
        // Second publish depends on if internalPutStorage waited
        // internalPutStorage awaits publish.
        // removeApp also calls publishDeletion

        // calls[0] = save library
        // calls[1] = delete request (Kind 5)

        const calls = mockPublish.mock.calls;
        expect(calls.length).toBeGreaterThanOrEqual(1);

        const [relays, event] = calls[0];
        // content should be remaining apps
        const savedApps = JSON.parse(event.content);
        expect(savedApps).toHaveLength(1);
        expect(savedApps[0].naddr).toBe("naddr2");
    });

    test("removeApp returns false if not found", async () => {
        const apps = [{ name: "App 1", naddr: "naddr1", createdAt: 1 }];
        mockGet.mockResolvedValue({
            content: JSON.stringify(apps)
        });

        const removed = await service.removeApp("naddr999");

        expect(removed).toBe(false);
        // Should NOT publish update
        expect(mockPublish).not.toHaveBeenCalled();
    });
});

