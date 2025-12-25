import { describe, test, expect, mock, beforeEach } from "bun:test";
import { sendDM, listDMs, getDMMessages, DMRouteContext } from "../src/engine/routes/dm";

// Mock NIP-17 helper
mock.module('../src/engine/nip17', () => ({
    wrapEvent: (event: any, recipient: string) => ({
        kind: 1059,
        content: "nip44:ciphertext",
        tags: [['p', recipient]],
        pubkey: "ephemeral_pubkey",
        created_at: Math.floor(Date.now() / 1000)
    }),
    unwrapEvent: async (wrap: any, decrypt: any) => {
        // Return the "Seal" (Kind 13)
        // In this mock, we assume the seal content was just "encrypted_seal_content"
        // We return a Mock Seal signed by Alice or Bob
        return {
            kind: 13,
            pubkey: wrap.tags.find((t: any) => t[0] === 'p')?.[1] === 'alice_hex' ? 'bob_hex' : 'alice_hex', // Inferred sender
            content: "encrypted_rumor", // This needs to be decrypted next
            created_at: 1000,
            tags: []
        };
    }
}));

describe("Direct Messages (NIP-17)", () => {
    let ctx: DMRouteContext;
    const alicePub = "alice_hex";
    const bobPub = "bob_hex";
    const publishedEvents: any[] = [];

    beforeEach(() => {
        publishedEvents.length = 0;
        ctx = {
            pool: {
                publish: async (e: any) => { publishedEvents.push(e); },
                subscribe: (filters: any[], onevent: any, oneose: any) => {
                    // Mock Inbox: Bob sent message to Alice
                    if (filters[0].kinds?.includes(1059)) {
                        onevent({
                            kind: 1059,
                            tags: [['p', alicePub]], // Replaces 'p' filter
                            content: "encrypted_gift",
                            pubkey: "random_ephemeral"
                        });
                        setTimeout(oneose, 0); // Async oneose
                    }
                    return () => { };
                }
            } as any,
            requestSign: async (e: any) => ({ ...e, id: "sig_mock", sig: "sig_mock" }),
            requestEncrypt: async (pk: string, txt: string) => `encrypted_${txt}_for_${pk}`,
            requestDecrypt: async (pk: string, txt: string) => {
                // Decrypting logic for test
                if (txt === "encrypted_rumor") {
                    // The seal contained this. Now we decrypt to get Rumor.
                    return JSON.stringify({
                        kind: 14,
                        content: "Hi Alice, it's Bob!",
                        pubkey: bobPub,
                        created_at: 1000,
                        tags: [['p', alicePub]]
                    });
                }
                return `decrypted_${txt}`;
            },
            currentPubkey: alicePub,
            appOrigin: "test"
        };
    });

    test("Send DM - Wraps twice (Recipient + Self)", async () => {
        const res = await sendDM(ctx, bobPub, { content: "Hello Bob!" });

        expect(res.status).toBe(201);
        expect(publishedEvents.length).toBe(2);

        // Both should be Kind 1059
        expect(publishedEvents[0].kind).toBe(1059);
        expect(publishedEvents[1].kind).toBe(1059);

        // One for Bob, One for Alice
        const pTags = publishedEvents.map(e => e.tags.find((t: any) => t[0] === 'p')?.[1]);
        expect(pTags).toContain(bobPub);
        expect(pTags).toContain(alicePub);
    });

    test("Send DM to Self - Wraps ONCE", async () => {
        const res = await sendDM(ctx, alicePub, { content: "Note to self" });
        expect(res.status).toBe(201);
        expect(publishedEvents.length).toBe(1); // Only one wrap
        const pTag = publishedEvents[0].tags.find((t: any) => t[0] === 'p');
        expect(pTag[1]).toBe(alicePub);
    });

    test("Receive DM -> Unwraps twice (Gift -> Seal -> Rumor)", async () => {
        // We override the 'unwrapEvent' behavior via the mock above 
        // and the ctx.requestDecrypt mock to simulate the double decryption.

        // The mock subscribe returns 1 message from Bob
        const res = await getDMMessages(ctx, bobPub, {});
        const messages = res.body as any[];

        expect(res.status).toBe(200);
        expect(messages.length).toBe(1);

        const msg = messages[0];
        expect(msg.content).toBe("Hi Alice, it's Bob!");
        expect(msg.sender).toBe(bobPub);
        expect(msg.isIncoming).toBe(true);
    });

    test("List DMs -> Aggregates conversations", async () => {
        const res = await listDMs(ctx);
        const conversations = res.body as any[];

        expect(res.status).toBe(200);
        expect(conversations.length).toBe(1); // Bob

        const bobConv = conversations.find(c => c.pubkey === bobPub);
        expect(bobConv).toBeTruthy();
        expect(bobConv.lastMessage).toBe("Hi Alice, it's Bob!");
    });
});
