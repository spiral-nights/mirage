import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { UserService } from '../src/engine/services/UserService';
import { SimplePool } from 'nostr-tools';

// Mock nostr-tools
const mockGet = mock();

mock.module("nostr-tools", () => ({
    SimplePool: class {
        get = mockGet;
    }
}));

describe('UserService', () => {
    let service: UserService;
    let mockPool: any;

    beforeEach(() => {
        mockGet.mockClear();
        mockPool = { get: mockGet };
        service = new UserService(mockPool, [], 'test-current-pubkey');
    });

    test('getCurrentUser returns profile for current pubkey', async () => {
        const metadata = { name: "me", about: "stuff" };
        const event = {
            id: 'ev1',
            pubkey: 'test-current-pubkey',
            content: JSON.stringify(metadata),
            kind: 0
        };

        mockGet.mockResolvedValue(event);

        const result = await service.getCurrentUser();

        expect(result.pubkey).toBe('test-current-pubkey');
        expect(result.name).toBe('me');
        expect(mockGet.mock.calls[0][1]).toEqual({ kinds: [0], authors: ['test-current-pubkey'], limit: 1 });
    });

    test('getUserByPubkey returns profile for any pubkey', async () => {
        const otherPubkey = 'other-pubkey';
        const metadata = { name: "other" };
        const event = {
            id: 'ev2',
            pubkey: otherPubkey,
            content: JSON.stringify(metadata),
            kind: 0
        };

        mockGet.mockResolvedValue(event);

        const result = await service.getUserByPubkey(otherPubkey);

        expect(result.pubkey).toBe(otherPubkey);
        expect(result.name).toBe('other');
    });

    test('throws if user not found', async () => {
        mockGet.mockResolvedValue(null);
        expect(service.getUserByPubkey('missing')).rejects.toThrow('User not found');
    });
});
