import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createChannel, listChannels, postChannelMessage, getChannelMessages, inviteMember, type ChannelRouteContext } from "../src/engine/routes/channels";
import { RelayPool } from "../src/engine/relay-pool";
import { generateSymmetricKey, encryptSymmetric, decryptSymmetric } from "../src/engine/crypto";

// Mock NIP-44 helpers for Storage
const mockEncrypt = mock(async (pubkey: string, plaintext: string) => `encrypted_${plaintext}`);
const mockDecrypt = mock(async (pubkey: string, ciphertext: string) => ciphertext.replace('encrypted_', ''));
const mockSign = mock(async (e: any) => ({ ...e, id: 'test_id', sig: 'test_sig', pubkey: 'test_pubkey' }));

describe("Channel Management (Phase 5)", () => {
    let ctx: ChannelRouteContext;
    let events: any[] = [];
    let subscriptions: any[] = [];

    beforeEach(() => {
        events = [];
        subscriptions = [];

        // Mock Pool
        const mockPool = {
            publish: mock(async (event: any) => {
                events.push(event);
            }),
            subscribe: mock((filters: any[], onEvent: any, onEose: any) => {
                const subId = `sub_${subscriptions.length}`;
                subscriptions.push({ id: subId, filters, onEvent });

                // Simulate immediate response for storage lookups
                // Logic: check filters, find matching events in 'events' array, send them
                setTimeout(() => {
                    for (const ev of events) {
                        // Very basic filter matching for mocked storage
                        if (filters[0].kinds?.includes(ev.kind) &&
                            filters[0]['#d']?.includes(ev.tags.find((t: any) => t[0] === 'd')?.[1])) {
                            onEvent(ev);
                        }
                        if (filters[0].kinds?.includes(42) && ev.kind === 42) {
                            onEvent(ev);
                        }
                    }
                    if (onEose) onEose();
                }, 10);

                return () => { };
            })
        } as unknown as RelayPool;

        ctx = {
            pool: mockPool,
            requestSign: mockSign,
            requestEncrypt: mockEncrypt,
            requestDecrypt: mockDecrypt,
            currentPubkey: 'test_pubkey',
            appOrigin: 'test_app'
        };
    });

    test("Create Channel -> Generates Key -> Saves to NIP-78", async () => {
        // 1. Create Channel
        const res = await createChannel(ctx, { name: "Secret Group" });
        expect(res.status).toBe(201);
        const channelId = (res.body as any).id;
        expect(channelId).toBeDefined();

        // 2. Verify NIP-78 storage event published
        expect(events.length).toBeGreaterThan(0);
        const storageEvent = events.find(e => e.kind === 30078);
        expect(storageEvent).toBeDefined();

        // 3. Verify content
        // It's encrypted by mockEncrypt -> "encrypted_..."
        const content = storageEvent.content;
        expect(content).toStartWith('encrypted_');

        // Decrypt manually using mock logic to verify payload
        const plaintext = content.replace('encrypted_', '');
        const map = JSON.parse(plaintext);
        const scopedId = `test_app:${channelId}`;

        expect(map[scopedId]).toBeDefined();
        expect(map[scopedId].version).toBe(1);
        expect(map[scopedId].key).toBeDefined(); // Base64 key
    });

    test("Post Message -> Encrypts with Key", async () => {
        // 1. Setup Channel
        const res1 = await createChannel(ctx, { name: "Chat" });
        const channelId = (res1.body as any).id;
        const keys = JSON.parse(events[0].content.replace('encrypted_', ''));
        const key = keys[`test_app:${channelId}`].key;

        // 2. Post Message
        const res2 = await postChannelMessage(ctx, channelId, { content: "Hello World" });
        expect(res2.status).toBe(201);

        // 3. Verify Event (Kind 42)
        const msgEvent = events.find(e => e.kind === 42);
        expect(msgEvent).toBeDefined();
        expect(msgEvent.content).not.toBe("Hello World"); // Encrypted

        // 4. Decrypt manually to verify
        // msgEvent.content is JSON { ciphertext, nonce }
        const payload = JSON.parse(msgEvent.content);
        const decrypted = decryptSymmetric(key, payload.ciphertext, payload.nonce);
        expect(decrypted).toBe("Hello World");
    });

    test("Invite Member -> Wraps with NIP-17", async () => {
        // 1. Setup Channel
        const res1 = await createChannel(ctx, { name: "Chat" });
        const channelId = (res1.body as any).id;

        // 2. Invite Bob
        const { generateSecretKey, getPublicKey } = require('nostr-tools');
        const bobPriv = generateSecretKey();
        const bobPubkey = getPublicKey(bobPriv);
        const res2 = await inviteMember(ctx, channelId, { pubkey: bobPubkey });
        expect(res2.status).toBe(200);

        // 3. Verify Wrapper (Kind 1059)
        const wrapEvent = events.find(e => e.kind === 1059);
        expect(wrapEvent).toBeDefined();

        // NIP-59 tags
        const pTag = wrapEvent.tags.find((t: any) => t[0] === 'p');
        expect(pTag[1]).toBe(bobPubkey);

        // We can't easily decrypt the wrap without the private key (ephemeral), 
        // but existing indicates wrapEvent logic ran.
    });
});
