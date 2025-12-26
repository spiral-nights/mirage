import { describe, expect, test, mock, beforeAll } from "bun:test";
import { fetchAppCode } from "../src/engine/routes/apps";
import { nip19 } from "nostr-tools";
import { RelayPool } from "../src/engine/relay-pool";

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
            query: mock(async () => mockEvent)
        } as unknown as RelayPool;

        const result = await fetchAppCode(mockPool, naddr);

        expect(result.html).toBe("<html>Test App</html>");
        expect(mockPool.query).toHaveBeenCalled();
        
        const filter = (mockPool.query as any).mock.calls[0][0][0];
        expect(filter.kinds).toContain(30078);
        expect(filter.authors).toContain(pubkey);
        expect(filter["#d"]).toContain(identifier);
    });

    test("fetchAppCode returns error for invalid naddr", async () => {
        const mockPool = {} as RelayPool;
        const result = await fetchAppCode(mockPool, "invalid-naddr");
        expect(result.error).toBeDefined();
    });
});
