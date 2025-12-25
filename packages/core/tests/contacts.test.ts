
import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { listContacts, updateContacts, type ContactsRouteContext } from '../src/engine/routes/contacts';
import type { Event, UnsignedEvent } from 'nostr-tools';

// Mock dependencies
const mockPool = {
    subscribe: mock(),
    publish: mock(),
};

const mockSign = mock(async (e: UnsignedEvent) => {
    return { ...e, id: 'test_id', sig: 'test_sig' } as Event;
});

const ctx: ContactsRouteContext = {
    pool: mockPool as any,
    requestSign: mockSign as any,
    requestEncrypt: mock(),
    requestDecrypt: mock(),
    currentPubkey: 'my_pubkey_hex',
    appOrigin: 'test_app'
};

describe('Contacts Routes (NIP-02)', () => {

    beforeEach(() => {
        mockPool.subscribe.mockReset();
        mockPool.publish.mockReset();
        mockSign.mockClear();
    });

    test('listContacts should fetch and parse Kind 3', async () => {
        // Mock Relay Response
        const mockEvent: Event = {
            id: '123',
            kind: 3,
            pubkey: 'my_pubkey_hex',
            created_at: 1000,
            tags: [
                ['p', 'friend_pubkey', 'wss://relay.io', 'Alice'],
                ['p', 'other_pubkey', '', 'Bob']
            ],
            content: '',
            sig: 'sig'
        };

        mockPool.subscribe.mockImplementation((filters, onevent, oneose) => {
            onevent(mockEvent);
            return () => { };
        });

        const res = await listContacts(ctx) as { status: number, body: any };

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toEqual({
            pubkey: 'friend_pubkey',
            relay: 'wss://relay.io',
            petname: 'Alice'
        });
        expect(res.body[1]).toEqual({
            pubkey: 'other_pubkey',
            relay: undefined, // empty string -> undefined in our logic? Check implementation
            petname: 'Bob'
        });
    });

    test('updateContacts should publish Kind 3', async () => {
        const newContacts = [
            { pubkey: 'new_friend', relay: 'wss://cool.relay', petname: 'Charlie' },
            { pubkey: 'simple_friend' }
        ];

        const res = await updateContacts(ctx, { contacts: newContacts }) as { status: number };

        expect(res.status).toBe(200);
        expect(mockSign).toHaveBeenCalled();

        const signedEvent = mockSign.mock.calls[0][0] as UnsignedEvent;
        expect(signedEvent.kind).toBe(3);
        expect(signedEvent.tags).toHaveLength(2);
        expect(signedEvent.tags[0]).toEqual(['p', 'new_friend', 'wss://cool.relay', 'Charlie']);
        // Note: Logic adds empty string for relay if petname is missing? No, only if petname exists.
        expect(signedEvent.tags[1]).toEqual(['p', 'simple_friend']);

        expect(mockPool.publish).toHaveBeenCalled();
    });
});
