import { describe, test, expect, mock, beforeEach } from "bun:test";
import { SimplePool } from "nostr-tools";
import { EventService } from "../src/engine/services/EventService";

// Mock nostr-tools
const mockQuerySync = mock();
const mockPublish = mock((_: any[], __: any) => [Promise.resolve()]);

mock.module("nostr-tools", () => ({
    SimplePool: class {
        querySync = mockQuerySync;
        publish = mockPublish;
    }
}));

describe("EventService", () => {
    let service: EventService;
    let mockPool: any;
    const mockSign = mock(async (e: any) => e);

    beforeEach(() => {
        mockQuerySync.mockClear();
        mockPublish.mockClear();
        mockSign.mockClear();

        mockPool = {
            querySync: mockQuerySync,
            publish: mockPublish,
        };
        service = new EventService(
            mockPool,
            ["wss://relay.test"],
            mockSign
        );
    });

    test("getEvents forwards filter to pool", async () => {
        const filter = { kinds: [1], limit: 10 };
        mockQuerySync.mockReturnValue([{ kind: 1, id: "ev1" }]);

        const events = await service.getEvents(filter);

        expect(events).toHaveLength(1);
        expect(mockQuerySync).toHaveBeenCalled();
        expect(mockQuerySync.mock.calls[0][1]).toEqual(filter);
    });

    test("publishEvent signs and publishes", async () => {
        const partial = { kind: 1, content: "hello" };

        await service.publishEvent(partial);

        expect(mockSign).toHaveBeenCalled();
        expect(mockPublish).toHaveBeenCalled();

        const [relays, event] = mockPublish.mock.calls[0];
        expect(relays).toEqual(["wss://relay.test"]);
        expect(event.content).toBe("hello");
    });

    test("publishEvent uses target relays if provided", async () => {
        const partial = { kind: 1, content: "hello" };
        const targets = ["wss://specific.relay"];

        await service.publishEvent(partial, targets);

        expect(mockPublish.mock.calls[0][0]).toEqual(targets);
    });
});
