import { describe, test, expect } from 'bun:test';
import type {
    ApiRequestMessage,
    ApiResponseMessage,
    SignEventMessage,
    RelayConfigMessage,
    Permission,
    UnsignedNostrEvent,
    NostrEvent,
} from '../src/types';

describe('Message Types', () => {
    test('ApiRequestMessage has correct shape', () => {
        const message: ApiRequestMessage = {
            type: 'API_REQUEST',
            id: 'test-123',
            method: 'GET',
            path: '/api/v1/feed',
            body: undefined,
        };

        expect(message.type).toBe('API_REQUEST');
        expect(message.method).toBe('GET');
        expect(message.path).toBe('/api/v1/feed');
    });

    test('ApiResponseMessage has correct shape', () => {
        const message: ApiResponseMessage = {
            type: 'API_RESPONSE',
            id: 'test-123',
            status: 200,
            body: { data: 'test' },
        };

        expect(message.type).toBe('API_RESPONSE');
        expect(message.status).toBe(200);
    });

    test('SignEventMessage has correct shape', () => {
        const event: UnsignedNostrEvent = {
            kind: 1,
            content: 'Hello world',
            tags: [],
            created_at: Math.floor(Date.now() / 1000),
        };

        const message: SignEventMessage = {
            type: 'ACTION_SIGN_EVENT',
            id: 'sign-123',
            event,
        };

        expect(message.type).toBe('ACTION_SIGN_EVENT');
        expect(message.event.kind).toBe(1);
    });

    test('RelayConfigMessage supports all actions', () => {
        const setMsg: RelayConfigMessage = {
            type: 'RELAY_CONFIG',
            id: 'config-1',
            action: 'SET',
            relays: ['wss://relay.test'],
        };

        const addMsg: RelayConfigMessage = {
            type: 'RELAY_CONFIG',
            id: 'config-2',
            action: 'ADD',
            relays: ['wss://new.relay'],
        };

        const removeMsg: RelayConfigMessage = {
            type: 'RELAY_CONFIG',
            id: 'config-3',
            action: 'REMOVE',
            relays: ['wss://old.relay'],
        };

        expect(setMsg.action).toBe('SET');
        expect(addMsg.action).toBe('ADD');
        expect(removeMsg.action).toBe('REMOVE');
    });
});

describe('Permission Types', () => {
    test('all permission values are valid', () => {
        const validPermissions: Permission[] = [
            'public_read',
            'public_write',
            'storage_read',
            'storage_write',
            'group_read',
            'group_write',
            'dm_read',
            'dm_write',
        ];

        expect(validPermissions).toHaveLength(8);
    });
});

describe('Nostr Event Types', () => {
    test('UnsignedNostrEvent can be created', () => {
        const event: UnsignedNostrEvent = {
            kind: 1,
            content: 'Test note',
            tags: [['p', 'pubkey123']],
            created_at: 1234567890,
        };

        expect(event.kind).toBe(1);
        expect(event.tags).toHaveLength(1);
    });

    test('NostrEvent extends UnsignedNostrEvent with signature', () => {
        const event: NostrEvent = {
            id: 'event-id-hex',
            pubkey: 'pubkey-hex',
            sig: 'signature-hex',
            kind: 1,
            content: 'Signed note',
            tags: [],
            created_at: 1234567890,
        };

        expect(event.id).toBeDefined();
        expect(event.pubkey).toBeDefined();
        expect(event.sig).toBeDefined();
    });
});
