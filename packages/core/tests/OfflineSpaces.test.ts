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
            deleteByFilter: spyOn(localRelay, 'deleteByFilter').mockResolvedValue(),
            handleDeletion: spyOn(localRelay, 'handleDeletion').mockResolvedValue(),
        };

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

        const savedKeys = saveKeysSpy.mock.calls[0][0];
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
        spyOn(spaceService, 'saveKeys').mockResolvedValue();

        // Delete space
        await spaceService.deleteSpace(spaceId, appOrigin);

        // Expect LocalRelay.deleteByFilter to be called
        expect(localRelaySpy.deleteByFilter).toHaveBeenCalled();
        // Verify filter passed targets the space ID
        const callArgs = localRelaySpy.deleteByFilter.mock.calls[0];
        expect(callArgs[0]).toEqual({ '#e': [spaceId] });
    });
});
