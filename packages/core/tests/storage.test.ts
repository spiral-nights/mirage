/**
 * Storage Routes Tests
 *
 * Tests for NIP-78 application-specific storage handlers with NIP-44 encryption.
 */

import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { getStorage, putStorage, deleteStorage, type StorageRouteContext } from '../src/engine/routes/storage';
import type { Event } from 'nostr-tools';

// ============================================================================
// Mocks
// ============================================================================

function createMockContext(overrides?: Partial<StorageRouteContext>): StorageRouteContext {
    const mockPool = {
        subscribe: mock((filters: any[], onEvent: (e: Event) => void, onEose?: () => void) => {
            return () => { }; // unsubscribe function
        }),
        publish: mock(async (event: Event) => { }),
        query: mock(async (filters: any[], timeout?: number) => null),
        queryAll: mock(async (filters: any[], timeout?: number) => []),
    };

    const mockSign = mock(async (event: any): Promise<Event> => ({
        ...event,
        id: 'test-event-id-' + Math.random().toString(36).slice(2),
        pubkey: 'test-pubkey-abc123def456',
        sig: 'test-signature-xyz789',
    }));

    // Mock encryption: just base64 encode for testing
    const mockEncrypt = mock(async (pubkey: string, plaintext: string): Promise<string> => {
        return 'encrypted:' + btoa(plaintext);
    });

    // Mock decryption: decode the mock encrypted format
    const mockDecrypt = mock(async (pubkey: string, ciphertext: string): Promise<string> => {
        if (ciphertext.startsWith('encrypted:')) {
            return atob(ciphertext.slice('encrypted:'.length));
        }
        throw new Error('Invalid ciphertext');
    });

    return {
        pool: mockPool as any,
        requestSign: mockSign,
        requestEncrypt: mockEncrypt,
        requestDecrypt: mockDecrypt,
        currentPubkey: 'test-pubkey-abc123def456',
        appOrigin: 'test-app',
        currentSpace: { id: 'test-space', name: 'Test Space' }, // Required for non-system apps
        ...overrides,
    };
}

// ============================================================================
// Tests
// ============================================================================

describe('getStorage', () => {
    test('returns 401 when not authenticated', async () => {
        const ctx = createMockContext({ currentPubkey: null });
        const result = await getStorage(ctx, 'test-key', {});

        expect(result.status).toBe(401);
        expect(result.body).toEqual({ error: 'Not authenticated' });
    });

    test('returns 404 when key not found', async () => {
        const ctx = createMockContext();
        // Pool returns no events (default query returns null)
        const result = await getStorage(ctx, 'nonexistent-key', {});

        expect(result.status).toBe(404);
        expect(result.body).toEqual({ error: 'Key not found' });
    });

    test('returns stored value when found', async () => {
        // Content is encrypted (using our mock format)
        const encryptedContent = 'encrypted:' + btoa(JSON.stringify({ theme: 'dark', fontSize: 14 }));
        const storedEvent: Event = {
            id: 'event-123',
            pubkey: 'test-pubkey-abc123def456',
            created_at: 1703203200,
            kind: 30078,
            tags: [['d', 'test-app:test-space:my-key']], // Updated d-tag format
            content: encryptedContent,
            sig: 'sig-xyz',
        };

        const ctx = createMockContext();
        // Mock query to return an event
        ctx.pool.query = mock(async () => storedEvent);

        const result = await getStorage(ctx, 'my-key', {});

        expect(result.status).toBe(200);
        expect((result.body as any).key).toBe('my-key');
        expect((result.body as any).value).toEqual({ theme: 'dark', fontSize: 14 });
    });

    test('Foreign Access: Reads unencrypted public data', async () => {
        const publicContent = JSON.stringify({ publicInfo: 'hello' });
        const foreignPubkey = 'foreign-pubkey-123';

        const storedEvent: Event = {
            id: 'event-public',
            pubkey: foreignPubkey,
            created_at: 1703203200,
            kind: 30078,
            tags: [['d', 'test-app:test-space:public-key']], // Updated d-tag format
            content: publicContent,
            sig: 'sig-abc',
        };

        const ctx = createMockContext();
        ctx.pool.query = mock(async (filters) => {
            // Check that we are querying the foreign pubkey
            if (filters[0].authors.includes(foreignPubkey)) {
                return storedEvent;
            }
            return null;
        });

        // Call getStorage with foreign pubkey
        const result = await getStorage(ctx, 'public-key', { pubkey: foreignPubkey });

        expect(result.status).toBe(200);
        expect((result.body as any).value).toEqual({ publicInfo: 'hello' });

        // Ensure NO decryption was attempted on foreign data
        expect(ctx.requestDecrypt).not.toHaveBeenCalled();
    });
});

describe('putStorage', () => {
    test('Default: Encrypts data', async () => {
        const ctx = createMockContext();
        const testData = { secret: "shhh" };

        await putStorage(ctx, 'settings', testData, {});

        expect(ctx.requestEncrypt).toHaveBeenCalled();
        const signCall = (ctx.requestSign as any).mock.calls[0];
        expect(signCall[0].content).toMatch(/^encrypted:/);
    });

    test('Public: Skips encryption when public=true', async () => {
        const ctx = createMockContext();
        const publicData = { visible: "everyone" };

        const result = await putStorage(ctx, 'profile', publicData, { public: 'true' });

        expect(result.status).toBe(200);
        expect((result.body as any).public).toBe(true);

        // Verify NO encryption called
        expect(ctx.requestEncrypt).not.toHaveBeenCalled();

        // Verify published content is plaintext JSON
        const signCall = (ctx.requestSign as any).mock.calls[0];
        expect(signCall[0].content).toBe(JSON.stringify(publicData));
    });
});
