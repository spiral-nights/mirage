import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { StorageService } from '../src/engine/services/StorageService';
import { SimplePool, type Event } from 'nostr-tools';

// Mock nostr-tools
const mockQuerySync = mock();
const mockGet = mock();
const mockPublish = mock((_: any[], __: any) => [Promise.resolve()]);

mock.module("nostr-tools", () => ({
    SimplePool: class {
        get = mockGet;
        querySync = mockQuerySync;
        publish = mockPublish;
    }
}));

describe('StorageService', () => {
    let service: StorageService;
    let mockPool: any;

    // Crypto mocks
    const mockSign = mock(async (event: any): Promise<Event> => ({
        ...event,
        id: 'test-event-id-' + Math.random().toString(36).slice(2),
        pubkey: 'test-pubkey-abc123def456',
        sig: 'test-signature-xyz789',
    }));

    const mockEncrypt = mock(async (pubkey: string, plaintext: string): Promise<string> => {
        return 'encrypted:' + btoa(plaintext);
    });

    const mockDecrypt = mock(async (pubkey: string, ciphertext: string): Promise<string> => {
        if (ciphertext.startsWith('encrypted:')) {
            return atob(ciphertext.slice('encrypted:'.length));
        }
        throw new Error('Invalid ciphertext');
    });

    beforeEach(() => {
        mockGet.mockClear();
        mockPublish.mockClear();
        mockSign.mockClear();
        mockEncrypt.mockClear();
        mockDecrypt.mockClear();

        mockPool = {
            get: mockGet,
            publish: mockPublish,
        };

        service = new StorageService(
            mockPool,
            ['wss://relay.test.com'],
            mockSign,
            mockEncrypt,
            mockDecrypt,
            'test-pubkey-abc123def456',
            { id: 'test-space', name: 'Test Space' }
        );
    });

    describe('getStorage', () => {
        test('throws when not authenticated', async () => {
            const anonService = new StorageService(mockPool, [], mockSign, mockEncrypt, mockDecrypt, null);
            expect(anonService.getStorage('key', 'app')).rejects.toThrow('Not authenticated');
        });

        test('returns null when key not found', async () => {
            mockGet.mockResolvedValue(null);
            const result = await service.getStorage('nonexistent', 'test-app');
            expect(result).toBeNull();
        });

        test('returns stored value when found', async () => {
            const encryptedContent = 'encrypted:' + btoa(JSON.stringify({ theme: 'dark' }));
            const storedEvent = {
                id: 'event-123',
                pubkey: 'test-pubkey-abc123def456',
                created_at: 1703203200,
                kind: 30078,
                tags: [['d', 'test-app:test-space:my-key']],
                content: encryptedContent,
                sig: 'sig-xyz',
            };

            mockGet.mockResolvedValue(storedEvent);
            const result = await service.getStorage('my-key', 'test-app');

            expect(result).toEqual({ theme: 'dark' });
        });

        test('reads unencrypted public data from foreign pubkey', async () => {
            const publicContent = JSON.stringify({ publicInfo: 'hello' });
            const foreignPubkey = 'foreign-pubkey-123';

            const storedEvent = {
                id: 'event-public',
                pubkey: foreignPubkey,
                content: publicContent,
                tags: [['d', 'test-app:test-space:public-key']],
            };

            mockGet.mockImplementation(async (relays: string[], filter: any) => {
                if (filter.authors.includes(foreignPubkey)) return storedEvent;
                return null;
            });

            const result = await service.getStorage('public-key', 'test-app', foreignPubkey);
            expect(result).toEqual({ publicInfo: 'hello' });
            expect(mockDecrypt).not.toHaveBeenCalled();
        });
    });

    describe('putStorage', () => {
        test('encrypts data by default', async () => {
            await service.putStorage('settings', { secret: "shhh" }, 'test-app');

            expect(mockEncrypt).toHaveBeenCalled();
            const signCall = mockSign.mock.calls[0];
            expect(signCall[0].content).toMatch(/^encrypted:/);
        });

        test('skips encryption when public=true', async () => {
            const publicData = { visible: "everyone" };
            await service.putStorage('profile', publicData, 'test-app', true);

            expect(mockEncrypt).not.toHaveBeenCalled();
            const signCall = mockSign.mock.calls[0];
            expect(signCall[0].content).toBe(JSON.stringify(publicData));
        });
    });

    describe('deleteStorage', () => {
        test('publishes deletion markers', async () => {
            await service.deleteStorage('key1', 'test-app');

            // Should publish tombstone and kind 5
            expect(mockPublish).toHaveBeenCalledTimes(2);
        });
    });
});
