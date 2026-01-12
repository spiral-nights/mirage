import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { SpaceService } from "../src/engine/services/SpaceService";
import { type UnsignedNostrEvent, type NostrEvent } from "../src/types";

// Mock NIP-04/44 encryption/decryption
const mockEncrypt = mock((pubkey: string, plaintext: string) => Promise.resolve(`encrypted:${plaintext}`));
const mockDecrypt = mock((pubkey: string, ciphertext: string) => Promise.resolve(ciphertext.replace("encrypted:", "")));

// Mock Signer
const mockSign = mock((event: UnsignedNostrEvent) => Promise.resolve({
    ...event,
    id: "mock_id_" + Math.random().toString(36).substring(7),
    sig: "mock_sig",
    pubkey: "test-pubkey"
} as NostrEvent));

// Mock Pool
const mockPool = {
    publish: mock(() => [Promise.resolve()]),
    querySync: mock(() => []),
    get: mock(() => Promise.resolve(null)),
    list: mock(() => Promise.resolve([])),
    close: mock(),
    sub: mock()
};

describe("SpaceService Unit Tests", () => {
    let service: SpaceService;
    const testPubkey = "test-pubkey";
    const testOrigin = "test-app";

    beforeEach(() => {
        // Reset mocks
        mockEncrypt.mockClear();
        mockDecrypt.mockClear();
        mockSign.mockClear();
        mockPool.publish.mockClear();
        mockPool.querySync.mockClear();
        mockPool.get.mockClear();
        mockPool.list.mockClear();

        service = new SpaceService({
            pool: mockPool as any,
            relays: ["wss://relay.example.com"],
            currentPubkey: testPubkey,
            appOrigin: testOrigin,
            requestSign: mockSign,
            requestDecrypt: mockDecrypt,
            requestEncrypt: mockEncrypt as any
        });
    });

    test("initializes correctly", () => {
        expect(service).toBeDefined();
    });

    describe("Space Management", () => {
        test("createSpace throws if origin is unknown", async () => {
            // Force context to be unknown
            service.updateContext({ appOrigin: 'unknown' });

            expect(service.createSpace("Bad Space")).rejects.toThrow("Cannot create space for unknown app origin");
        });

        test("createSpace respects forAppOrigin override", async () => {
            // Force context to be unknown
            service.updateContext({ appOrigin: 'unknown' });
            mockPool.querySync.mockReturnValue([]);

            const space = await service.createSpace("Override Space", "valid-app-origin");

            expect(space.appOrigin).toBe("valid-app-origin");
            expect(space.name).toBe("Override Space");
        });

        test("createSpace generates keys and saves to NIP-78", async () => {
            // Reset context to valid
            service.updateContext({ appOrigin: testOrigin });
            // Mock empty existing keys
            mockPool.querySync.mockReturnValue([]);

            const space = await service.createSpace("My Space");

            expect(space).toBeDefined();
            expect(space.name).toBe("My Space");
            expect(space.id).toBeDefined();

            // Verify it tried to publish to contacts (Kind 30078)
            expect(mockPool.publish).toHaveBeenCalled();
            expect(mockSign).toHaveBeenCalled();
        });

        test("listSpaces returns spaces from global keychain", async () => {
            const spaceId = "space123";
            const scopedId = `${testOrigin}:${spaceId}`;

            // Mock data matching KeyMap structure
            const mapObj = {
                [scopedId]: {
                    id: spaceId,
                    name: "Existing Space",
                    key: "mock_sym_key",
                    version: 1,
                    createdAt: 1000,
                    admin: true,
                    deleted: false
                }
            };

            const encryptedContent = "encrypted:" + JSON.stringify(mapObj);

            const mockKeychainEvent = {
                kind: 30078,
                tags: [["d", "mirage-app:mirage:space_keys"]],
                content: encryptedContent,
                pubkey: testPubkey,
                created_at: 1000
            };

            mockPool.querySync.mockReturnValue([mockKeychainEvent]);
            mockPool.list.mockReturnValue(Promise.resolve([mockKeychainEvent]));
            mockPool.get.mockReturnValue(Promise.resolve(mockKeychainEvent));

            const spaces = await service.listSpaces();

            expect(spaces.length).toBe(1);
            expect(spaces[0].id).toBe(spaceId);
            expect(spaces[0].name).toBe("Existing Space");
        });

        test("deleteSpace marks space as deleted", async () => {
            // Setup existing space
            const spaceId = "s1";
            const scopedId = `${testOrigin}:${spaceId}`;
            const mockData = {
                [scopedId]: {
                    id: spaceId,
                    name: "Space to Delete",
                    key: "mock_key",
                    deleted: false
                }
            };

            const encryptedContent = "encrypted:" + JSON.stringify(mockData);
            const mockEvent = {
                kind: 30078,
                tags: [["d", "mirage-app:mirage:space_keys"]],
                content: encryptedContent,
                pubkey: testPubkey
            };

            // First call returns existing, subsequent might return updated if logic re-queries
            mockPool.querySync.mockReturnValue([mockEvent]);
            mockPool.list.mockReturnValue(Promise.resolve([mockEvent]));
            mockPool.get.mockReturnValue(Promise.resolve(mockEvent));

            const deletedId = await service.deleteSpace(spaceId);

            expect(deletedId).toBe(spaceId);
            expect(mockPool.publish).toHaveBeenCalled();
        });

        test("deleteSpace works for spaces with custom app origin", async () => {
            // Reset context
            service.updateContext({ appOrigin: testOrigin });
            mockPool.querySync.mockReturnValue([]);

            // 1. Create space with custom origin
            const customOrigin = "custom-app-origin";
            const space = await service.createSpace("Custom Space", customOrigin);
            expect(space.appOrigin).toBe(customOrigin);

            // 2. Delete it
            await service.deleteSpace(space.id);

            // 3. Verify it was marked as deleted in the saved keys
            expect(mockPool.publish).toHaveBeenCalled();
        });

        test("updateSpace updates space name", async () => {
            const spaceId = "s1";
            const scopedId = `${testOrigin}:${spaceId}`;

            const mapObj = {
                [scopedId]: {
                    id: spaceId,
                    name: "Old Name",
                    key: "mock_key",
                    admin: true,
                    deleted: false
                }
            };

            const encryptedContent = "encrypted:" + JSON.stringify(mapObj);

            const mockKeychainEvent = {
                kind: 30078,
                tags: [["d", "mirage-app:mirage:space_keys"]],
                content: encryptedContent,
                pubkey: testPubkey,
                created_at: 1000
            };

            mockPool.querySync.mockReturnValue([mockKeychainEvent]);
            mockPool.list.mockReturnValue(Promise.resolve([mockKeychainEvent]));
            mockPool.get.mockReturnValue(Promise.resolve(mockKeychainEvent));

            const result = await service.updateSpace(spaceId, "New Name");
            expect(result.name).toBe("New Name");
            expect(mockPool.publish).toHaveBeenCalled();
        });
    });

    describe("Messaging", () => {
        test("sendMessage publishes encrypted event", async () => {
            // We need a current space context or pass spaceId.
            // sendMessage(spaceId, content)
            const spaceId = "s1";
            const scopedId = `${testOrigin}:${spaceId}`;

            const mockKeys = {
                [scopedId]: {
                    id: spaceId,
                    key: "YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=", // valid 32-byte base64
                    name: "Chat",
                    deleted: false
                }
            };

            const encryptedKeys = "encrypted:" + JSON.stringify(mockKeys);
            const mockKeychainEvent = {
                kind: 30078,
                tags: [["d", "mirage-app:mirage:space_keys"]],
                content: encryptedKeys,
                pubkey: testPubkey
            };

            mockPool.querySync.mockReturnValue([mockKeychainEvent]);
            mockPool.list.mockReturnValue(Promise.resolve([mockKeychainEvent]));
            mockPool.get.mockReturnValue(Promise.resolve(mockKeychainEvent));

            const msg = await service.sendMessage(spaceId, "Hello World");

            expect(msg).toBeDefined();
            expect(mockPool.publish).toHaveBeenCalled();
        });
    });
});
