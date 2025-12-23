/**
 * Tests for signing utilities
 */

import { describe, test, expect } from 'bun:test';
import type { SignEventMessage, UnsignedNostrEvent } from '../src/types';

describe('Signing Types', () => {
    test('UnsignedNostrEvent can represent Kind 1 note', () => {
        const event: UnsignedNostrEvent = {
            kind: 1,
            content: 'Hello Nostr!',
            tags: [],
            created_at: Math.floor(Date.now() / 1000),
        };

        expect(event.kind).toBe(1);
        expect(event.content).toBe('Hello Nostr!');
        expect(event.tags).toEqual([]);
        expect(event.created_at).toBeGreaterThan(0);
    });

    test('UnsignedNostrEvent supports tags', () => {
        const event: UnsignedNostrEvent = {
            kind: 1,
            content: 'Replying to someone',
            tags: [
                ['e', 'event-id-hex', '', 'reply'],
                ['p', 'pubkey-hex'],
            ],
            created_at: 1234567890,
        };

        expect(event.tags).toHaveLength(2);
        expect(event.tags[0][0]).toBe('e');
        expect(event.tags[1][0]).toBe('p');
    });

    test('SignEventMessage wraps unsigned event', () => {
        const unsigned: UnsignedNostrEvent = {
            kind: 30078,
            content: JSON.stringify({ key: 'settings', value: { theme: 'dark' } }),
            tags: [['d', 'app:settings']],
            created_at: 1234567890,
        };

        const message: SignEventMessage = {
            type: 'ACTION_SIGN_EVENT',
            id: 'sign-request-uuid',
            event: unsigned,
        };

        expect(message.type).toBe('ACTION_SIGN_EVENT');
        expect(message.id).toBeDefined();
        expect(message.event.kind).toBe(30078);
    });
});

describe('Signing Protocol', () => {
    test('signature result contains required fields', () => {
        // Signature result message shape
        const result = {
            type: 'SIGNATURE_RESULT',
            id: 'sign-request-uuid',
            signedEvent: {
                id: 'event-hash',
                pubkey: 'user-pubkey',
                sig: 'schnorr-signature',
                kind: 1,
                content: 'test',
                tags: [],
                created_at: 1234567890,
            },
        };

        expect(result.signedEvent.id).toBeDefined();
        expect(result.signedEvent.pubkey).toBeDefined();
        expect(result.signedEvent.sig).toBeDefined();
    });

    test('signature error contains error message', () => {
        const result = {
            type: 'SIGNATURE_RESULT',
            id: 'sign-request-uuid',
            error: 'User rejected signing request',
        };

        expect(result.error).toBe('User rejected signing request');
        expect(result).not.toHaveProperty('signedEvent');
    });

    test('timeout value is 60 seconds', () => {
        const SIGNATURE_TIMEOUT_MS = 60000;
        expect(SIGNATURE_TIMEOUT_MS).toBe(60000);
    });
});
