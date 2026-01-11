import { describe, expect, test, mock } from "bun:test";
import { fetchAppCode } from "../src/engine/routes/apps";
import { nip19, type SimplePool } from "nostr-tools";

describe("Apps Route", () => {
    test("fetchAppCode decodes naddr and queries pool", async () => {
        const pubkey = "00".repeat(32);
        const identifier = "test-app";
        const naddr = nip19.naddrEncode({
            kind: 30078,
            pubkey,
            identifier,
        });

        const mockEvent = {
            kind: 30078,
            pubkey,
            content: "<html>Test App</html>",
            tags: [["d", identifier]],
            created_at: 123456789,
            id: "123",
            sig: "sig"
        };

        const mockPool = {
            get: mock(async (relays: string[], filter: any) => mockEvent)
        } as unknown as SimplePool;

        const relays = ['wss://relay.test.com'];
        const result = await fetchAppCode(mockPool, relays, naddr);

        expect(result.html).toBe("<html>Test App</html>");
        expect(mockPool.get).toHaveBeenCalled();

        const [callRelays, filter] = (mockPool.get as any).mock.calls[0];
        expect(filter.kinds).toContain(30078);
        expect(filter.authors).toContain(pubkey);
        expect(filter["#d"]).toContain(identifier);
    });

    test("fetchAppCode returns error for invalid naddr", async () => {
        const mockPool = {} as SimplePool;
        const relays = ['wss://relay.test.com'];
        const result = await fetchAppCode(mockPool, relays, "invalid-naddr");
        expect(result.error).toBeDefined();
    });
});
