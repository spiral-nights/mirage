import { describe, test, expect, mock, beforeEach } from "bun:test";
import { SimplePool } from "nostr-tools";
import { ContactService, type Contact } from "../src/engine/services/ContactService";

// Mock nostr-tools
const mockGet = mock();
const mockPublish = mock((_: any[], __: any) => [Promise.resolve()]);
const mockDecode = mock((s: string) => {
    if (s === "invalid") throw new Error("Invalid");
    if (s.startsWith("npub")) return { type: "npub", data: "hex-pubkey" };
    return { type: "unknown", data: s };
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

describe("ContactService", () => {
    let service: ContactService;
    let mockPool: any;
    const mockSign = mock(async (e: any) => e);
    const myPubkey = "my-pubkey";

    beforeEach(() => {
        mockGet.mockClear();
        mockPublish.mockClear();
        mockDecode.mockClear();

        mockPool = {
            get: mockGet,
            publish: mockPublish,
        };
        service = new ContactService(
            mockPool,
            ["wss://relay.test"],
            mockSign,
            myPubkey
        );
    });

    test("listContacts retrieves my contacts", async () => {
        const contactEvent = {
            kind: 3,
            tags: [
                ["p", "friend1", "relay1", "pet1"],
                ["p", "friend2"]
            ],
            content: ""
        };
        mockGet.mockResolvedValue(contactEvent);

        const contacts = await service.listContacts();

        expect(contacts).toHaveLength(2);
        expect(contacts[0]).toEqual({ pubkey: "friend1", relay: "relay1", petname: "pet1" });
        expect(contacts[1]).toEqual({ pubkey: "friend2", relay: undefined, petname: undefined });
        expect(mockGet).toHaveBeenCalled();
    });

    test("listContacts throws if not authenticated", async () => {
        service = new ContactService(mockPool, [], mockSign, null);

        expect(service.listContacts()).rejects.toThrow("Not authenticated");
    });

    test("getUserContacts retrieves other user's contacts", async () => {
        mockGet.mockResolvedValue({
            kind: 3,
            tags: [["p", "friend3"]]
        });

        const contacts = await service.getUserContacts("other-pubkey");

        expect(contacts).toHaveLength(1);
        expect(contacts[0].pubkey).toBe("friend3");

        const filter = mockGet.mock.calls[0][1]; // (relays, filter)
        expect(filter.authors).toContain("other-pubkey");
    });

    test("updateContacts publishes Kind 3 event", async () => {
        const newContacts: Contact[] = [
            { pubkey: "new-friend", relay: "wss://relay.new", petname: "bestie" }
        ];

        await service.updateContacts(newContacts);

        expect(mockSign).toHaveBeenCalled();
        expect(mockPublish).toHaveBeenCalled();

        const [relays, event] = mockPublish.mock.calls[0];
        expect(event.kind).toBe(3);
        const tags = event.tags;
        expect(tags).toHaveLength(1);
        expect(tags[0]).toEqual(["p", "new-friend", "wss://relay.new", "bestie"]);
    });

    test("updateContacts requires authentication", async () => {
        service = new ContactService(mockPool, [], mockSign, null);

        expect(service.updateContacts([])).rejects.toThrow("Not authenticated");
    });
});
