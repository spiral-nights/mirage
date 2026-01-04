import { describe, expect, test } from "bun:test";
import { LocalSigner } from "../src/local-signer";
import { createNewSecretKey, getPublicKey } from "../src/auth";

describe("LocalSigner", () => {
    test("implements Nip07Signer basics", async () => {
        const sk = createNewSecretKey();
        const pk = getPublicKey(sk);
        const signer = new LocalSigner(sk);

        expect(await signer.getPublicKey()).toBe(pk);

        const event = {
            kind: 1,
            content: "Hello Mirage",
            tags: [],
            created_at: Math.floor(Date.now() / 1000),
            pubkey: pk
        };

        const signed = await signer.signEvent(event);
        expect(signed.pubkey).toBe(pk);
        expect(signed.sig).toBeDefined();
        expect(signed.id).toBeDefined();
    });

    test("implements nip44 encryption/decryption", async () => {
        const sk = createNewSecretKey();
        const pk = getPublicKey(sk);
        const signer = new LocalSigner(sk);

        const plaintext = "Secret message";
        const ciphertext = await signer.nip44!.encrypt(pk, plaintext);
        expect(ciphertext).not.toBe(plaintext);

        const decrypted = await signer.nip44!.decrypt(pk, ciphertext);
        expect(decrypted).toBe(plaintext);
    });
});
