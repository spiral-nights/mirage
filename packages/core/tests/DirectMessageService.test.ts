import { describe, test, expect, mock, beforeEach } from "bun:test";
import { SimplePool } from "nostr-tools";
import { DirectMessageService, type DMMessage } from "../src/engine/services/DirectMessageService";

// Mock NIP-17 helpers
// We need to mock '../src/engine/nip17'
const mockWrap = mock((event: any, recipient: string) => ({
    kind: 1059,
    content: "wrapped-" + recipient,
    tags: [["p", recipient]],
    created_at: Math.floor(Date.now() / 1000),
    pubkey: "sender"
}));
const mockUnwrap = mock(async (wrap: any, decrypt: any) => {
    if (wrap.content.startsWith("fail")) return null;
    return {
        kind: 13,
        content: "sealed-content",
        pubkey: "sender-pubkey",
        created_at: 1000
    };
});

mock.module("../src/engine/nip17", () => ({
    wrapEvent: mockWrap,
    unwrapEvent: mockUnwrap
}));

// Mock nostr-tools
const mockQuerySync = mock();
const mockPublish = mock((_: any[], __: any) => [Promise.resolve()]);
const mockDecode = mock((s: string) => {
    if (s === "invalid") throw new Error("Invalid");
    if (s.startsWith("npub")) return { type: "npub", data: "hex-pubkey" };
    return { type: "unknown", data: s };
});

mock.module("nostr-tools", () => ({
    SimplePool: class {
        querySync = mockQuerySync;
        publish = mockPublish;
    },
    nip19: {
        decode: mockDecode
    }
}));

describe("DirectMessageService", () => {
    let service: DirectMessageService;
    let mockPool: any;
    const mockSign = mock(async (e: any) => e);
    const mockEncrypt = mock(async (_: string, p: string) => "encrypted-" + p);
    // Decrypt needs to return a valid JSON string for Rumor (Kind 14)
    const mockDecrypt = mock(async (_: string, c: string) => {
        if (c === "sealed-content") {
            const rumor = {
                kind: 14,
                pubkey: "sender-pubkey",
                content: "Hello",
                created_at: 1000,
                tags: [["p", "my-pubkey"]],
                id: "rumor-id"
            };
            return JSON.stringify(rumor);
        }
        return c;
    });
    const myPubkey = "my-pubkey";

    beforeEach(() => {
        mockQuerySync.mockClear();
        mockPublish.mockClear();
        mockDecode.mockClear();
        mockWrap.mockClear();
        mockUnwrap.mockClear();
        mockDecrypt.mockClear();

        mockPool = {
            querySync: mockQuerySync,
            publish: mockPublish,
        };
        service = new DirectMessageService(
            mockPool,
            ["wss://relay.test"],
            mockSign,
            mockEncrypt,
            mockDecrypt,
            myPubkey
        );
    });

    test("listDMs unwraps and aggregates conversations", async () => {
        // Mock querySync response (wraps)
        mockQuerySync.mockReturnValue([
            { kind: 1059, content: "wrap1", id: "wrap1" },
            { kind: 1059, content: "wrap2", id: "wrap2" } // Same sender, older
        ]);

        const conversations = await service.listDMs();

        expect(conversations).toHaveLength(1);
        expect(conversations[0].pubkey).toBe("sender-pubkey");
        expect(conversations[0].lastMessage).toBe("Hello");
        expect(mockQuerySync).toHaveBeenCalled();
        expect(mockDecrypt).toHaveBeenCalled();
    });

    test("getMessages unwraps and filters history", async () => {
        mockQuerySync.mockReturnValue([
            { kind: 1059, content: "wrap1", id: "wrap1" }
        ]);

        const messages = await service.getMessages("sender-pubkey");

        expect(messages).toHaveLength(1);
        expect(messages[0].content).toBe("Hello");
        expect(messages[0].isIncoming).toBe(true);
    });

    test("sendDM encrypts, signs, wraps, and publishes", async () => {
        const result = await service.sendDM("recipient-pubkey", "secret message");

        // Verify encryption called (Rumor -> Seal)
        expect(mockEncrypt).toHaveBeenCalled();
        // Verify signing called (Seal)
        expect(mockSign).toHaveBeenCalled();
        // Verify wrapping called (Seal -> Gift)
        expect(mockWrap).toHaveBeenCalled();
        // Verify publish called
        expect(mockPublish).toHaveBeenCalled();

        // Should publish twice (once to recipient, once to self)
        expect(mockPublish).toHaveBeenCalledTimes(2);

        expect(result.content).toBe("secret message");
    });

    test("sendDM to self publishes once", async () => {
        await service.sendDM(myPubkey, "note to self");
        expect(mockPublish).toHaveBeenCalledTimes(1);
    });
});
