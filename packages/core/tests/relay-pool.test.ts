import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { RelayPool } from '../src/engine/relay-pool';

// Mock nostr-tools Relay
const mockRelay = {
    url: 'wss://test.relay',
    close: mock(() => { }),
    publish: mock(async () => { }),
    subscribe: mock(() => ({ close: () => { } })),
};

mock.module('nostr-tools', () => ({
    Relay: {
        connect: mock(async (url: string) => ({
            ...mockRelay,
            url,
        })),
    },
}));

describe('RelayPool', () => {
    beforeEach(() => {
        // Reset mocks between tests
        mockRelay.close.mockClear();
        mockRelay.publish.mockClear();
        mockRelay.subscribe.mockClear();
    });

    test('initializes with provided relays', async () => {
        const pool = new RelayPool({
            relays: ['wss://relay1.test', 'wss://relay2.test'],
        });

        // Wait for connections
        await new Promise((r) => setTimeout(r, 100));

        const relays = pool.getRelays();
        expect(relays).toContain('wss://relay1.test');
        expect(relays).toContain('wss://relay2.test');

        pool.close();
    });

    test('initializes empty without options', () => {
        const pool = new RelayPool();
        expect(pool.getRelays()).toEqual([]);
        pool.close();
    });

    test('adds a relay dynamically', async () => {
        const pool = new RelayPool();

        await pool.addRelay('wss://new.relay');

        expect(pool.getRelays()).toContain('wss://new.relay');
        pool.close();
    });

    test('removes a relay', async () => {
        const pool = new RelayPool();
        await pool.addRelay('wss://temp.relay');

        expect(pool.getRelays()).toContain('wss://temp.relay');

        pool.removeRelay('wss://temp.relay');

        expect(pool.getRelays()).not.toContain('wss://temp.relay');
        pool.close();
    });

    test('setRelays replaces all relays', async () => {
        const pool = new RelayPool({
            relays: ['wss://old1.relay', 'wss://old2.relay'],
        });

        await new Promise((r) => setTimeout(r, 100));

        await pool.setRelays(['wss://new1.relay', 'wss://new2.relay']);

        const relays = pool.getRelays();
        expect(relays).not.toContain('wss://old1.relay');
        expect(relays).not.toContain('wss://old2.relay');
        expect(relays).toContain('wss://new1.relay');
        expect(relays).toContain('wss://new2.relay');

        pool.close();
    });

    test('close() clears all relays', async () => {
        const pool = new RelayPool({
            relays: ['wss://relay.test'],
        });

        await new Promise((r) => setTimeout(r, 100));

        pool.close();

        expect(pool.getRelays()).toEqual([]);
    });
});
