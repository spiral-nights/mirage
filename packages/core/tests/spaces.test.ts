import { describe, test, expect, mock, beforeEach } from "bun:test";
import {
    createSpace,
    deleteSpace,
    postSpaceMessage,
    inviteMember,
    syncInvites,
    updateSpaceStore,
    getSpaceStore,
    type SpaceRouteContext
} from "../src/engine/routes/spaces";
import type { SimplePool } from "nostr-tools";
import { decryptSymmetric } from "../src/engine/crypto";
import { generateSecretKey, getPublicKey } from "nostr-tools";
import { bytesToHex } from "@noble/ciphers/utils.js";

// Mock NIP-44 helpers for Storage
const mockEncrypt = mock(async (pubkey: string, plaintext: string) => `encrypted_${plaintext}`);
const mockDecrypt = mock(async (pubkey: string, ciphertext: string) => ciphertext.replace('encrypted_', ''));
const mockSign = mock(async (e: any) => ({ ...e, id: 'test_id', sig: 'test_sig', pubkey: 'test_pubkey' }));

function matches(event: any, filter: any) {
    if (filter.kinds && !filter.kinds.includes(event.kind)) return false;
    if (filter.authors && !filter.authors.includes(event.pubkey)) return false;
    if (filter['#d']) {
        const d = event.tags.find((t: any) => t[0] === 'd')?.[1];
        if (!d || !filter['#d'].includes(d)) return false;
    }
    if (filter['#p']) {
        const p = event.tags.find((t: any) => t[0] === 'p')?.[1];
        if (!p || !filter['#p'].includes(p)) return false;
    }
    if (filter['#t']) {
        const tTags = event.tags.filter((t: any) => t[0] === 't').map((t: any) => t[1]);
        if (!tTags.some((tag: string) => filter['#t'].includes(tag))) return false;
    }
    if (filter.since && event.created_at < filter.since) return false;
    return true;
}

describe("Space Management (Phase 5)", () => {
    let ctx: SpaceRouteContext;
    let events: any[] = [];
    let subscriptions: any[] = [];

    beforeEach(() => {
        events = [];
        subscriptions = [];

        // Mock Pool
        const mockPool = {
            publish: mock((relays: string[], event: any) => {
                events.push(event);
                return [Promise.resolve()];
            }),
            subscribe: mock((filters: any[], params: any) => {
                const subId = `sub_${subscriptions.length}`;
                const onEvent = params.onevent;
                const onEose = params.oneose;
                subscriptions.push({ id: subId, filters, onEvent });
                setTimeout(() => {
                    for (const ev of events) {
                        for (const f of filters) {
                            if (matches(ev, f)) {
                                onEvent(ev);
                                break;
                            }
                        }
                    }
                    if (onEose) onEose();
                }, 10);
                return { close: () => { } };
            }),
            get: mock(async (filter: any) => {
                for (let i = events.length - 1; i >= 0; i--) {
                    const ev = events[i];
                    if (matches(ev, filter)) return ev;
                }
                return null;
            }),
            querySync: mock((relays: string[], filter: any) => {
                const res = [];
                const filters = [filter];
                for (const ev of events) {
                    for (const f of filters) {
                        if (matches(ev, f)) {
                            res.push(ev);
                            break;
                        }
                    }
                }
                return res;
            }),
            getRelays: mock(() => [])
        } as unknown as SimplePool;

        ctx = {
            pool: mockPool,
            requestSign: mockSign,
            requestEncrypt: mockEncrypt,
            requestDecrypt: mockDecrypt,
            currentPubkey: 'test_pubkey',
            appOrigin: 'test_app',
            relays: ['wss://relay.example.com']
        };
    });

    test("Create Space -> Generates Key -> Saves to NIP-78", async () => {
        // 1. Create Space
        const res = await createSpace(ctx, { name: "Family Groceries" });
        expect(res.status).toBe(201);
        const spaceId = (res.body as any).id;
        expect(spaceId).toBeDefined();

        // 2. Verify NIP-78 storage event published
        expect(events.length).toBeGreaterThan(0);
        const storageEvent = events.find(e => e.kind === 30078);
        expect(storageEvent).toBeDefined();

        // 3. Verify content
        const content = storageEvent.content;
        expect(content).toStartWith('encrypted_');

        // Decrypt manually
        const plaintext = content.replace('encrypted_', '');
        const map = JSON.parse(plaintext);
        const scopedId = `test_app:${spaceId}`;

        expect(map[scopedId]).toBeDefined();
        expect(map[scopedId].version).toBe(1);
        expect(map[scopedId].key).toBeDefined();
    });

    test("Shared KV: Update Key -> Publishes Encrypted Kind 42", async () => {
        // 1. Setup Space
        const res1 = await createSpace(ctx, { name: "KV Test" });
        const spaceId = (res1.body as any).id;

        // Get Key from storage event
        const keys = JSON.parse(events[0].content.replace('encrypted_', ''));
        const key = keys[`test_app:${spaceId}`].key;

        // 2. Update KV
        const res2 = await updateSpaceStore(ctx, spaceId, "milk", { qty: 2 });
        expect(res2.status).toBe(200);

        // 3. Verify Event
        const kvEvent = events.find(e => e.kind === 42 && e.tags.some((t: any) => t[0] === 't' && t[1] === 'mirage_store'));
        expect(kvEvent).toBeDefined();

        // Verify Tags
        expect(kvEvent.tags).toContainEqual(['t', 'mirage_store']);
        expect(kvEvent.tags).toContainEqual(['k', 'milk']);

        // 4. Verify Content (Decrypt)
        const payload = JSON.parse(kvEvent.content);
        const plaintext = decryptSymmetric(key, payload.ciphertext, payload.nonce);
        expect(plaintext).toBeDefined();
        const data = JSON.parse(plaintext!);

        // ["store_put", "milk", { qty: 2 }]
        expect(data[0]).toBe("store_put");
        expect(data[1]).toBe("milk");
        expect(data[2]).toEqual({ qty: 2 });
    });

    test("Shared KV: Get Store -> Returns Merged State", async () => {
        // 1. Setup Space
        const res1 = await createSpace(ctx, { name: "KV Test" });
        const spaceId = (res1.body as any).id;

        // 2. Add some updates
        await updateSpaceStore(ctx, spaceId, "milk", { qty: 1 });
        // Mock created_at to be increasing (since mockSign sets it? No, postSpaceMessage sets it)
        // Wait to ensure timestamp diff? Or mock created_at manually in events?
        // updateSpaceStore calls postSpaceMessage -> events.push.
        // We can manually tweak the last event's timestamp.
        events[events.length - 1].created_at += 10;

        await updateSpaceStore(ctx, spaceId, "eggs", { qty: 12 });
        events[events.length - 1].created_at += 20;

        await updateSpaceStore(ctx, spaceId, "milk", { qty: 2 }); // Overwrite milk
        events[events.length - 1].created_at += 30;

        // 3. Get Store
        const res3 = await getSpaceStore(ctx, spaceId);
        expect(res3.status).toBe(200);

        const state = res3.body as any;
        expect(state.milk).toEqual({ qty: 2 }); // Latest wins
        expect(state.eggs).toEqual({ qty: 12 });
    });

    test("Invite Member -> Publishes NIP-17 Gift Wrap", async () => {
        // 1. Setup Space
        const res1 = await createSpace(ctx, { name: "Invite Test" });
        const spaceId = (res1.body as any).id;

        // 2. Invite Bob (Must use a valid secp256k1 pubkey for NIP-44 math to work)
        const sk = generateSecretKey();
        const bobPubkey = getPublicKey(sk);

        const res2 = await inviteMember(ctx, spaceId, { pubkey: bobPubkey });
        expect(res2.status).toBe(200);
        expect((res2.body as any).invited).toBe(bobPubkey);

        // 3. Verify Gift Wrap Event (Kind 1059)
        const wrapEvent = events.find(e => e.kind === 1059);
        expect(wrapEvent).toBeDefined();
        // Recipient tag
        expect(wrapEvent.tags).toContainEqual(['p', bobPubkey]);
    });

    test("Soft Delete -> Sets deleted flag", async () => {
        const res1 = await createSpace(ctx, { name: "Delete Test" });
        const spaceId = (res1.body as any).id;

        // Delete
        await deleteSpace(ctx, spaceId);

        // Verify key has deleted: true
        // We check the last NIP-78 event
        const storageEvent = events[events.length - 1];
        const content = storageEvent.content.replace('encrypted_', '');
        const keys = JSON.parse(content);
        const scopedId = `test_app:${spaceId}`;

        expect(keys[scopedId].deleted).toBe(true);
        expect(keys[scopedId].deletedAt).toBeDefined();
    });

    test("Revive Deleted Space -> Invite Newer than Delete", async () => {
        // 1. Create and Delete
        const res1 = await createSpace(ctx, { name: "Revive Test" });
        const spaceId = (res1.body as any).id;
        await deleteSpace(ctx, spaceId); // Deletion happens now

        // Get deletion timestamp
        const delEvent = events[events.length - 1];
        const delKeys = JSON.parse(delEvent.content.replace('encrypted_', ''));
        const deletedAt = delKeys[`test_app:${spaceId}`].deletedAt;

        // 2. Mock a NEW invite (Kind 1059) that arrived LATER
        const invitePayload = {
            type: 'mirage_invite',
            spaceId,
            scopedId: `test_app:${spaceId}`,
            key: 'some_key',
            version: 1,
            name: 'Revived Space'
        };

        const innerEvent = {
            kind: 13,
            content: JSON.stringify(invitePayload),
            created_at: deletedAt + 100 // 100 seconds AFTER deletion
        };

        // Mock wrapped event
        const wrapEvent = {
            kind: 1059,
            pubkey: 'sender_ephemeral',
            created_at: deletedAt + 100,
            tags: [['p', ctx.currentPubkey]],
            content: `encrypted_${JSON.stringify(innerEvent)}`
        };

        // Add to pool so syncInvites finds it
        events.push(wrapEvent);

        // 3. Run syncInvites
        await syncInvites(ctx);

        // 4. Verify key is revived
        const reviveEvent = events[events.length - 1];
        const reviveKeys = JSON.parse(reviveEvent.content.replace('encrypted_', ''));

        expect(reviveKeys[`test_app:${spaceId}`].deleted).toBe(false);
        expect(reviveKeys[`test_app:${spaceId}`].deletedAt).toBeUndefined();
    });
});