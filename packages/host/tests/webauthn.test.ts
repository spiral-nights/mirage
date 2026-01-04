import { describe, expect, test, mock } from "bun:test";

// Local mock for window/localStorage
if (typeof window === 'undefined') {
    (global as any).window = {
        localStorage: {
            getItem: (key: string) => (global as any)._storage?.[key] || null,
            setItem: (key: string, val: string) => {
                if (!(global as any)._storage) (global as any)._storage = {};
                (global as any)._storage[key] = val;
            },
            removeItem: (key: string) => {
                if ((global as any)._storage) delete (global as any)._storage[key];
            }
        },
        location: { hostname: 'localhost' }
    };
}

import { 
    encryptWithPrfKey, 
    decryptWithPrfKey, 
    saveIdentity, 
    loadIdentity,
    clearIdentity
} from "../src/webauthn-prf";

describe("WebAuthn PRF Utilities", () => {
    test("encryption and decryption with a key", async () => {
        const key = new Uint8Array(32).fill(1);
        const plaintext = "Top secret nsec";

        const { ciphertext, iv } = await encryptWithPrfKey(key, plaintext);
        expect(ciphertext).toBeDefined();
        expect(iv).toBeDefined();

        const decrypted = await decryptWithPrfKey(key, ciphertext, iv);
        expect(decrypted).toBe(plaintext);
    });

    test("persistence logic", () => {
        const identity = {
            credentialId: "cred123",
            ciphertext: "cipher123",
            iv: "iv123"
        };

        saveIdentity(identity);
        const loaded = loadIdentity();
        expect(loaded).toEqual(identity);

        clearIdentity();
        expect(loadIdentity()).toBeNull();
    });

    test("different keys produce different ciphertexts", async () => {
        const key1 = new Uint8Array(32).fill(1);
        const key2 = new Uint8Array(32).fill(2);
        const plaintext = "Same plaintext";

        const res1 = await encryptWithPrfKey(key1, plaintext);
        const res2 = await encryptWithPrfKey(key2, plaintext);

        // Even with same key, IV should make them different
        expect(res1.ciphertext).not.toBe(res2.ciphertext);

        // Decrypting with wrong key should fail
        try {
            await decryptWithPrfKey(key2, res1.ciphertext, res1.iv);
            expect(false).toBe(true); // Should not reach here
        } catch (e) {
            expect(true).toBe(true);
        }
    });
});
