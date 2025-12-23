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
        ...overrides,
    };
}

// ============================================================================
// Tests
// ============================================================================

describe('getStorage', () => {
    test('returns 401 when not authenticated', async () => {
        const ctx = createMockContext({ currentPubkey: null });
        const result = await getStorage(ctx, 'test-key');

        expect(result.status).toBe(401);
        expect(result.body).toEqual({ error: 'Not authenticated' });
    });

    test('returns 404 when key not found', async () => {
        const ctx = createMockContext();
        // Pool returns no events
        const result = await getStorage(ctx, 'nonexistent-key');

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
            tags: [['d', 'test-app:my-key']],
            content: encryptedContent,
            sig: 'sig-xyz',
        };

        const ctx = createMockContext();
        // Mock subscribe to return an event
        ctx.pool.subscribe = mock((filters, onEvent, onEose) => {
            onEvent(storedEvent);
            return () => { };
        });

        const result = await getStorage(ctx, 'my-key');

        expect(result.status).toBe(200);
        expect((result.body as any).key).toBe('my-key');
        expect((result.body as any).value).toEqual({ theme: 'dark', fontSize: 14 });
        expect((result.body as any).updatedAt).toBe(1703203200);
    });

    test('handles non-JSON content gracefully', async () => {
        const encryptedContent = 'encrypted:' + btoa('plain text value');
        const storedEvent: Event = {
            id: 'event-456',
            pubkey: 'test-pubkey-abc123def456',
            created_at: 1703203200,
            kind: 30078,
            tags: [['d', 'test-app:text-key']],
            content: encryptedContent,
            sig: 'sig-abc',
        };

        const ctx = createMockContext();
        ctx.pool.subscribe = mock((filters, onEvent, onEose) => {
            onEvent(storedEvent);
            return () => { };
        });

        const result = await getStorage(ctx, 'text-key');

        expect(result.status).toBe(200);
        expect((result.body as any).value).toBe('plain text value');
    });
});

describe('putStorage', () => {
    test('returns 401 when not authenticated', async () => {
        const ctx = createMockContext({ currentPubkey: null });
        const result = await putStorage(ctx, 'test-key', { data: 'value' });

        expect(result.status).toBe(401);
        expect(result.body).toEqual({ error: 'Not authenticated' });
    });

    test('creates signed event with encrypted content', async () => {
        const ctx = createMockContext();
        const testData = { counter: 42, enabled: true };

        const result = await putStorage(ctx, 'settings', testData);

        expect(result.status).toBe(200);
        expect((result.body as any).key).toBe('settings');
        expect((result.body as any).value).toEqual(testData); // Returns original

        // Verify requestEncrypt was called
        expect(ctx.requestEncrypt).toHaveBeenCalled();

        // Verify requestSign was called with encrypted content (not plaintext)
        expect(ctx.requestSign).toHaveBeenCalled();
        const signCall = (ctx.requestSign as any).mock.calls[0];
        const unsignedEvent = signCall[0];

        expect(unsignedEvent.kind).toBe(30078);
        expect(unsignedEvent.tags).toContainEqual(['d', 'test-app:settings']);
        expect(unsignedEvent.content).toMatch(/^encrypted:/);  // Content is encrypted
    });

    test('publishes signed event to relay pool', async () => {
        const ctx = createMockContext();
        await putStorage(ctx, 'my-data', 'simple value');

        expect(ctx.pool.publish).toHaveBeenCalled();
    });

    test('encrypts string values', async () => {
        const ctx = createMockContext();
        await putStorage(ctx, 'raw-string', 'just a string');

        // Verify encryption was called with the string
        expect(ctx.requestEncrypt).toHaveBeenCalledWith(
            'test-pubkey-abc123def456',
            'just a string'
        );
    });
});

describe('deleteStorage', () => {
    test('returns 401 when not authenticated', async () => {
        const ctx = createMockContext({ currentPubkey: null });
        const result = await deleteStorage(ctx, 'test-key');

        expect(result.status).toBe(401);
        expect(result.body).toEqual({ error: 'Not authenticated' });
    });

    test('publishes encrypted empty event with deleted tag', async () => {
        const ctx = createMockContext();
        const result = await deleteStorage(ctx, 'old-setting');

        expect(result.status).toBe(200);
        expect((result.body as any).deleted).toBe(true);
        expect((result.body as any).key).toBe('old-setting');

        // Verify encryption was called (even for empty content)
        expect(ctx.requestEncrypt).toHaveBeenCalled();

        // Verify the event structure
        const signCall = (ctx.requestSign as any).mock.calls[0];
        const unsignedEvent = signCall[0];

        expect(unsignedEvent.kind).toBe(30078);
        expect(unsignedEvent.content).toMatch(/^encrypted:/);  // Encrypted empty content
        expect(unsignedEvent.tags).toContainEqual(['d', 'test-app:old-setting']);
        expect(unsignedEvent.tags).toContainEqual(['deleted', 'true']);
    });

    test('publishes to relay pool', async () => {
        const ctx = createMockContext();
        await deleteStorage(ctx, 'to-delete');

        expect(ctx.pool.publish).toHaveBeenCalled();
    });
});

describe('storage key scoping', () => {
    test('d tag includes app origin for isolation', async () => {
        const ctx = createMockContext({ appOrigin: 'my-custom-app.com' });
        await putStorage(ctx, 'preferences', {});

        const signCall = (ctx.requestSign as any).mock.calls[0];
        expect(signCall[0].tags).toContainEqual(['d', 'my-custom-app.com:preferences']);
    });

    test('different apps have different d tags', async () => {
        const ctx1 = createMockContext({ appOrigin: 'app1.example' });
        const ctx2 = createMockContext({ appOrigin: 'app2.example' });

        await putStorage(ctx1, 'shared-key', { from: 'app1' });
        await putStorage(ctx2, 'shared-key', { from: 'app2' });

        const sign1 = (ctx1.requestSign as any).mock.calls[0];
        const sign2 = (ctx2.requestSign as any).mock.calls[0];

        expect(sign1[0].tags[0]).toEqual(['d', 'app1.example:shared-key']);
        expect(sign2[0].tags[0]).toEqual(['d', 'app2.example:shared-key']);
    });
});
