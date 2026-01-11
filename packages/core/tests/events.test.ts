/**
 * Event Routes Tests
 *
 * Tests for generic Nostr event handlers (/events).
 */

import { describe, test, expect, mock } from 'bun:test';
import { getEvents, postEvents, type EventsRouteContext } from '../src/engine/routes/events';
import type { Event } from 'nostr-tools';

// ============================================================================
// Mocks
// ============================================================================

function createMockContext(overrides?: Partial<EventsRouteContext>): EventsRouteContext {
    const mockPool = {
        subscribe: mock(),
        publish: mock((relays: string[], event: Event) => [Promise.resolve()]),
        get: mock(),
        querySync: mock(async (relays: string[], filter: any) => []),
    };

    const mockSign = mock(async (event: any): Promise<Event> => ({
        ...event,
        id: 'test-event-id-' + Math.random().toString(36).slice(2),
        pubkey: 'test-pubkey-abc123def456',
        sig: 'test-signature-xyz789',
    }));

    return {
        pool: mockPool as any,
        relays: ['wss://relay.test.com'],
        requestSign: mockSign,
        ...overrides,
    };
}

// ============================================================================
// Tests
// ============================================================================

describe('getEvents', () => {
    test('uses default limit of 20', async () => {
        const ctx = createMockContext();
        await getEvents(ctx, {});

        const filter = (ctx.pool.querySync as any).mock.calls[0][1];
        expect(filter).toEqual({ limit: 20 });
    });

    test('parses kinds filter', async () => {
        const ctx = createMockContext();
        await getEvents(ctx, { kinds: '1,0,3' });

        const filter = (ctx.pool.querySync as any).mock.calls[0][1];
        expect(filter.kinds).toEqual([1, 0, 3]);
    });

    test('parses authors filter', async () => {
        const ctx = createMockContext();
        await getEvents(ctx, { authors: 'pubkey1,pubkey2' });

        const filter = (ctx.pool.querySync as any).mock.calls[0][1];
        expect(filter.authors).toEqual(['pubkey1', 'pubkey2']);
    });

    test('parses simplified tag filters', async () => {
        const ctx = createMockContext();
        await getEvents(ctx, { tags: ['t:nostr', 'p:person1'] });

        const filter = (ctx.pool.querySync as any).mock.calls[0][1];
        expect(filter['#t']).toEqual(['nostr']);
        expect(filter['#p']).toEqual(['person1']);
    });

    test('returns events from pool', async () => {
        const ctx = createMockContext();
        const mockEvent: Event = {
            id: 'evt1',
            pubkey: 'pk1',
            created_at: 100,
            kind: 1,
            tags: [],
            content: 'hello',
            sig: 'sig'
        };

        ctx.pool.querySync = mock(async () => [mockEvent]);

        const result = await getEvents(ctx, {});
        expect(result.status).toBe(200);
        expect(result.body).toEqual([mockEvent]);
    });
});

describe('postEvents', () => {
    test('publishes signed event', async () => {
        const ctx = createMockContext();
        const note = { kind: 1, content: 'hello world' };

        const result = await postEvents(ctx, note);

        expect(result.status).toBe(201);
        expect((result.body as Event).content).toBe('hello world');
        expect((result.body as Event).kind).toBe(1);

        expect(ctx.requestSign).toHaveBeenCalled();
        expect(ctx.pool.publish).toHaveBeenCalled();
    });

    test('fails on missing fields', async () => {
        const ctx = createMockContext();
        // @ts-ignore
        const result = await postEvents(ctx, { kind: 1 }); // Missing content

        expect(result.status).toBe(400);
    });
});