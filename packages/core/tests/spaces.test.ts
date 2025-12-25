import { describe, test, expect, mock, beforeEach } from "bun:test";
import { 
    createSpace, 
    postSpaceMessage, 
    inviteMember, 
    updateSpaceStore, 
    getSpaceStore,
    type SpaceRouteContext 
} from "../src/engine/routes/spaces";
import { RelayPool } from "../src/engine/relay-pool";
import { decryptSymmetric } from "../src/engine/crypto";

// Mock NIP-44 helpers for Storage
const mockEncrypt = mock(async (pubkey: string, plaintext: string) => `encrypted_${plaintext}`);
const mockDecrypt = mock(async (pubkey: string, ciphertext: string) => ciphertext.replace('encrypted_', ''));
const mockSign = mock(async (e: any) => ({ ...e, id: 'test_id', sig: 'test_sig', pubkey: 'test_pubkey' }));

describe("Space Management (Phase 5)", () => {
    let ctx: SpaceRouteContext;
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
                setTimeout(() => {
                    for (const ev of events) {
                        // Storage lookup
                        if (filters[0].kinds?.includes(30078) &&
                            ev.kind === 30078 &&
                            filters[0]['#d']?.includes(ev.tags.find((t: any) => t[0] === 'd')?.[1])) {
                            onEvent(ev);
                        }
                        // Space lookup (Kind 42)
                        if (filters[0].kinds?.includes(42) && ev.kind === 42) {
                            // Check topic filter
                            if (filters[0]['#t'] && !ev.tags.some((t:any) => t[0] === 't' && filters[0]['#t'].includes(t[1]))) {
                                continue;
                            }
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
        const kvEvent = events.find(e => e.kind === 42 && e.tags.some((t:any) => t[0] === 't' && t[1] === 'mirage_store'));
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
        await new Promise(r => setTimeout(r, 20)); // Ensure timestamp diff
        await updateSpaceStore(ctx, spaceId, "eggs", { qty: 12 });
        await new Promise(r => setTimeout(r, 20));
        await updateSpaceStore(ctx, spaceId, "milk", { qty: 2 }); // Overwrite milk

        // 3. Get Store
        const res3 = await getSpaceStore(ctx, spaceId);
        expect(res3.status).toBe(200);

        const state = res3.body as any;
        expect(state.milk).toEqual({ qty: 2 }); // Latest wins
        expect(state.eggs).toEqual({ qty: 12 });
    });
});