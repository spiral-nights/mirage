import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { MirageEngine } from "../src/engine/MirageEngine";
import { LocalRelay } from "../src/engine/LocalRelay";
import { type Event } from "nostr-tools/pure";
import { AbstractRelay } from "nostr-tools/abstract-relay";

// Mock Dexie for LocalRelay to avoid actual indexedDB calls in test
mock.module("dexie", () => {
    return {
        default: class Dexie {
            constructor(name: string) { }
            version() { return { stores: () => { } } }
            table() { return {} }
        }
    };
});

describe("Offline Spaces Integration", () => {
    let engine: MirageEngine;
    let localRelaySpy: any;
    let poolSpy: any;

    beforeEach(async () => {
        // Setup engine with Mocks
        const config = {
            relays: ["wss://relay.example.com"],
            pubkey: "test-pubkey",
        };

        engine = new MirageEngine(config);

        // Mock LocalRelay methods
        const localRelay = (engine as any).localRelay;
        localRelaySpy = {
            publish: spyOn(localRelay, 'publish').mockResolvedValue('ok'),
            deleteByFilter: spyOn(localRelay, 'deleteByFilter').mockResolvedValue(undefined),
            handleDeletion: spyOn(localRelay, 'handleDeletion').mockResolvedValue(undefined),
        };

        // Update pool's localRelay reference
        if ((engine as any).pool && (engine as any).pool.localRelay) {
            (engine as any).pool.localRelay = localRelay;
        }

        // Mock SimplePool publish to track external calls
        const pool = (engine as any).pool;
        poolSpy = {
            publish: spyOn(pool, 'publish').mockImplementation(() => [Promise.resolve('ok')]),
        };

        // Initialize engine (simulate ready)
        (engine as any)._initialized = true;

        // Set pubkey via message handler
        await engine.handleMessage({
            type: 'SET_PUBKEY',
            id: 'init-auth',
            pubkey: 'test-pubkey'
        } as any);

        const spaceService = (engine as any).spaceService;

        // Assert ctx is engine
        console.log("Is ctx equal to engine?", spaceService.ctx === engine);

        // Overwrite requestSign directly on the context used by spaceService
        spaceService.ctx.requestSign = async (event: any) => {
            console.log("Mock requestSign called (via ctx)");
            return {
                ...event,
                id: 'mock-id',
                sig: 'mock-sig'
            };
        };
        spaceService.ctx.requestEncrypt = mock(() => Promise.resolve("enc:{}"));
        spaceService.ctx.requestDecrypt = mock(() => Promise.resolve("{}"));
    });

    afterEach(() => {
        mock.restore();
    });

    it("should create an offline space correctly", async () => {
        const spaceService = (engine as any).spaceService;

        // Spy on saveKeys to check if offline flag is saved
        const saveKeysSpy = spyOn(spaceService, 'saveKeys').mockImplementation(async () => { });
        // Mock getKeys to return empty map initially
        spyOn(spaceService, 'getKeys').mockResolvedValue(new Map());

        const space = await spaceService.createSpace("My Offline Space", "app1", true);

        expect(space).toBeDefined();
        expect(space.offline).toBe(true);

        const savedKeys = saveKeysSpy.mock.calls[0][0] as Map<string, any>;
        const spaceKey = Array.from(savedKeys.values())[0] as any;
        expect(spaceKey.offline).toBe(true);
    });

    it("should route messages to LocalRelay for offline spaces", async () => {
        const spaceService = (engine as any).spaceService;
        const spaceId = "space1";
        const appOrigin = "app1";

        // Setup space context as offline
        const dummyKey = "YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=";
        const keys = new Map();
        keys.set(`${appOrigin}:${spaceId}`, {
            id: spaceId,
            name: "Offline Space",
            appOrigin,
            offline: true,
            key: dummyKey
        });
        spyOn(spaceService, 'getKeys').mockResolvedValue(keys);

        // Send a message
        await spaceService.sendMessage(spaceId, "Hello Offline", appOrigin);

        // Expect LocalRelay.publish to be called
        expect(localRelaySpy.publish).toHaveBeenCalled();
        // Expect External Pool.publish NOT to be called
        expect(poolSpy.publish).not.toHaveBeenCalled();
    });

    it("should route messages to External Pool for online spaces", async () => {
        const spaceService = (engine as any).spaceService;
        const spaceId = "space2";
        const appOrigin = "app1";

        // Setup space context as ONLINE
        const dummyKey = "YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=";
        const keys = new Map();
        keys.set(`${appOrigin}:${spaceId}`, {
            id: spaceId,
            name: "Online Space",
            appOrigin,
            offline: false,
            key: dummyKey
        });
        spyOn(spaceService, 'getKeys').mockResolvedValue(keys);

        // Send a message
        await spaceService.sendMessage(spaceId, "Hello Online", appOrigin);

        // Expect LocalRelay.publish NOT to be called
        expect(localRelaySpy.publish).not.toHaveBeenCalled();
        // Expect External Pool.publish to be called
        expect(poolSpy.publish).toHaveBeenCalled();
    });

    it("should wipe local data when deleting an offline space", async () => {
        const spaceService = (engine as any).spaceService;
        const spaceId = "space1";
        const appOrigin = "app1";

        // Setup offline space
        const keys = new Map();
        keys.set(`${appOrigin}:${spaceId}`, {
            id: spaceId,
            name: "Offline Space",
            appOrigin,
            offline: true
        });
        spyOn(spaceService, 'getKeys').mockResolvedValue(keys);
        spyOn(spaceService, 'saveKeys').mockResolvedValue(undefined);

        // Delete space
        await spaceService.deleteSpace(spaceId, appOrigin);

        // Expect LocalRelay.deleteByFilter to be called
        expect(localRelaySpy.deleteByFilter).toHaveBeenCalled();
        // Verify filter passed targets the space ID
        const callArgs = localRelaySpy.deleteByFilter.mock.calls[0];
        expect(callArgs[0]).toEqual({ '#e': [spaceId] });
    });

    it("should NOT publish offline space keys to External Pool", async () => {
        const spaceService = (engine as any).spaceService;

        // Mock requestEncrypt to verify payload
        // We need to overwrite the one in context which is likely undefined or default?
        // spaceService.ctx has it.
        spaceService.ctx.requestEncrypt = async (pk: string, txt: string) => "enc:" + txt;

        // Mock getKeys to return empty initially so we start fresh
        // But createSpace calls saveKeys which uses the keys from getKeys + new key.
        // So we want getKeys to return empty map.
        // BUT we need to spyOn getKeys again because it might have been spied on in beforeEach?
        // In beforeEach: no spy on getKeys.
        // In this test:
        const getKeysSpy = spyOn(spaceService, 'getKeys').mockResolvedValue(new Map());

        // Reset spies
        poolSpy.publish.mockClear();
        localRelaySpy.publish.mockClear();

        // We also need to restore saveKeys if it was mocked? 
        // beforeEach doesn't mock saveKeys.
        // "should wipe local data" test mocked saveKeys.
        // But afterEach restores mocks. So we are good.

        await spaceService.createSpace("Leak Test Space", "app1", true);

        // Check Pool Publish Calls
        const poolCalls = poolSpy.publish.mock.calls;

        // Find the Offline Key Event (targeting mirage://local)
        // args[0] is relays array, args[1] is event
        const offlineCall = poolCalls.find((args: any) =>
            Array.isArray(args[0]) && args[0].includes('mirage://local') && args[1].kind === 30078
        );
        expect(offlineCall).toBeDefined();
        // Verify content
        const offlineEvent = offlineCall[1];
        expect(offlineEvent.content).toContain("Leak Test Space");

        // Find the Online Key Event (targeting external relays)
        const onlineCall = poolCalls.find((args: any) =>
            Array.isArray(args[0]) && !args[0].includes('mirage://local') && args[1].kind === 30078
        );

        if (onlineCall) {
            const content = onlineCall[1].content;
            expect(content).toContain("enc:{}"); // Empty map (mockEncrypt output)
            expect(content).not.toContain("Leak Test Space");
        }
    });

    it("should propagate offline flag from API request to SpaceService (Regression Test)", async () => {
        const spaceService = (engine as any).spaceService;
        const createSpaceSpy = spyOn(spaceService, 'createSpace').mockResolvedValue({
            id: 'mock-id',
            name: 'Mock Output',
            createdAt: 1000,
            appOrigin: 'app1',
            offline: true
        });

        // Simulate API Message from Host
        const message = {
            type: 'API_REQUEST',
            id: 'req1',
            method: 'POST',
            path: '/mirage/v1/admin/spaces',
            body: {
                name: 'API Space',
                appOrigin: 'app1',
                offline: true // THIS IS THE FLAG THAT WAS BEING IGNORED
            },
            origin: 'app1'
        };

        // We need to wait for poolReady in handleApiRequest. 
        // _initialized set in beforeEach should handle simple cases but handleApiRequest awaits poolReady.
        // The mock engine doesn't expose the real poolReady promise easily testable here without hacking.
        // HOWEVER, handleMessage awaits handleApiRequest.
        await engine.handleMessage(message as any);

        expect(createSpaceSpy).toHaveBeenCalled();
        const args = createSpaceSpy.mock.calls[0];
        expect(args[0]).toBe('API Space');
        expect(args[1]).toBe('app1');
        expect(args[2]).toBe(true); // The regression check
    });

    it("should preserve app origin for offline spaces (Persistence)", async () => {
        const spaceService = (engine as any).spaceService;
        const appOrigin = "30078:pubkey:app-d-tag";

        const saveKeysSpy = spyOn(spaceService, 'saveKeys').mockResolvedValue(undefined);
        spyOn(spaceService, 'getKeys').mockResolvedValue(new Map());

        const space = await spaceService.createSpace("Persistence Test", appOrigin, true);

        const savedKeysMap = saveKeysSpy.mock.calls[0][0] as Map<string, any>;
        const keys = Array.from(savedKeysMap.keys());

        // Assert the KEY itself contains the appOrigin
        const expectedPrefix = `${appOrigin}:`;
        const matchingKey = keys.find(k => k.startsWith(expectedPrefix));

        expect(matchingKey).toBeDefined();
        // The space object returned should also have it
        expect(space.appOrigin).toBe(appOrigin);
    });

    it("should strictly isolate offline data from external relays (Data Privacy)", async () => {
        const spaceService = (engine as any).spaceService;
        const appOrigin = "app1";

        // Setup mock keys
        spyOn(spaceService, 'getKeys').mockResolvedValue(new Map());

        // Custom Spy Implementation to track where data goes
        const externalCalls: any[] = [];

        poolSpy.publish.mockImplementation((relays: string[], event: any) => {
            const promises: Promise<any>[] = [];

            // Simulate routing
            if (relays.includes('mirage://local')) {
                promises.push(localRelaySpy.publish(event));
            } else {
                promises.push(Promise.resolve());
            }

            // Track external pushes
            const externalRelays = relays.filter(r => r !== 'mirage://local');
            if (externalRelays.length > 0) {
                externalCalls.push({ relays: externalRelays, event });
            }

            return promises;
        });

        localRelaySpy.publish.mockClear();

        // 1. Create Space (Offline)
        const space = await spaceService.createSpace("Private Space", appOrigin, true);

        // 2. Rename Space (Generates Metadata Event)
        // Need to mock getKeys to return the new space key so updateSpace works
        const keys = new Map();
        // Use a known valid 32-byte key to avoid Bun's atob/btoa issues with random bytes
        const safeKey = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="; // 32 bytes of zeros
        const spaceWithSafeKey = { ...space, key: safeKey, offset: 0 };

        keys.set(`${appOrigin}:${space.id}`, spaceWithSafeKey);
        // We override the spy to return our new key
        spaceService.getKeys = async () => keys; // quicker than spyOn again

        await spaceService.updateSpace(space.id, "Renamed Private Space", appOrigin);

        // 3. Send Message
        await spaceService.sendMessage(space.id, "Secret Message", appOrigin);

        // VERIFICATION

        // Assertions:
        // 1. LocalRelay should receive Space Key (create), Space Key (update), Message.
        expect(localRelaySpy.publish).toHaveBeenCalledTimes(3);

        // 2. External Pool should receive ONLY the KeyChain update (Kind 30078), NOT the Message or Space Metadata.

        for (const call of externalCalls) {
            const event = call.event;
            // Should be NIP-78 (Kind 30078) -> The Global Keychain
            if (event.kind === 30078) {
                // Should simply contain empty/safeguarded content, not our private strings
                expect(event.content).not.toContain("Private Space");
                expect(event.content).not.toContain("Secret Message");
            } else {
                throw new Error(`Leaked event to external relay: Kind ${event.kind}`);
            }
        }
    });
});
