/**
 * Crypto Tests
 * 
 * Tests for symmetric encryption primitives used by space encryption.
 */

import { describe, test, expect } from 'bun:test';
import {
    generateSymmetricKey,
    generateRandomId,
    encryptSymmetric,
    decryptSymmetric
} from '../src/engine/crypto';

describe('Crypto Primitives', () => {
    describe('generateSymmetricKey', () => {
        test('returns a base64 encoded string', () => {
            const key = generateSymmetricKey();
            expect(typeof key).toBe('string');
            expect(key.length).toBeGreaterThan(0);

            // Should be valid base64
            expect(() => atob(key)).not.toThrow();
        });

        test('returns 32-byte key (256 bits)', () => {
            const key = generateSymmetricKey();
            const bytes = Uint8Array.from(atob(key), c => c.charCodeAt(0));
            expect(bytes.length).toBe(32);
        });

        test('generates unique keys', () => {
            const keys = new Set<string>();
            for (let i = 0; i < 100; i++) {
                keys.add(generateSymmetricKey());
            }
            expect(keys.size).toBe(100);
        });
    });

    describe('generateRandomId', () => {
        test('returns 64-character hex string', () => {
            const id = generateRandomId();
            expect(id.length).toBe(64);
            expect(/^[0-9a-f]+$/.test(id)).toBe(true);
        });

        test('generates unique IDs', () => {
            const ids = new Set<string>();
            for (let i = 0; i < 100; i++) {
                ids.add(generateRandomId());
            }
            expect(ids.size).toBe(100);
        });
    });

    describe('encryptSymmetric + decryptSymmetric', () => {
        test('roundtrip encryption/decryption', () => {
            const key = generateSymmetricKey();
            const plaintext = 'Hello, World!';

            const { ciphertext, nonce } = encryptSymmetric(key, plaintext);
            const decrypted = decryptSymmetric(key, ciphertext, nonce);

            expect(decrypted).toBe(plaintext);
        });

        test('handles JSON payloads', () => {
            const key = generateSymmetricKey();
            const data = { message: 'secret', count: 42, nested: { value: true } };
            const plaintext = JSON.stringify(data);

            const { ciphertext, nonce } = encryptSymmetric(key, plaintext);
            const decrypted = decryptSymmetric(key, ciphertext, nonce);

            expect(JSON.parse(decrypted!)).toEqual(data);
        });

        test('handles unicode characters', () => {
            const key = generateSymmetricKey();
            const plaintext = '🔐 Encrypted message with émojis and ñ special chars 日本語';

            const { ciphertext, nonce } = encryptSymmetric(key, plaintext);
            const decrypted = decryptSymmetric(key, ciphertext, nonce);

            expect(decrypted).toBe(plaintext);
        });

        test('handles empty string', () => {
            const key = generateSymmetricKey();
            const plaintext = '';

            const { ciphertext, nonce } = encryptSymmetric(key, plaintext);
            const decrypted = decryptSymmetric(key, ciphertext, nonce);

            expect(decrypted).toBe(plaintext);
        });

        test('same plaintext produces different ciphertext (random nonce)', () => {
            const key = generateSymmetricKey();
            const plaintext = 'Test message';

            const result1 = encryptSymmetric(key, plaintext);
            const result2 = encryptSymmetric(key, plaintext);

            expect(result1.ciphertext).not.toBe(result2.ciphertext);
            expect(result1.nonce).not.toBe(result2.nonce);
        });
    });

    describe('decryptSymmetric error handling', () => {
        test('returns null for wrong key', () => {
            const key1 = generateSymmetricKey();
            const key2 = generateSymmetricKey();
            const plaintext = 'Secret message';

            const { ciphertext, nonce } = encryptSymmetric(key1, plaintext);
            const decrypted = decryptSymmetric(key2, ciphertext, nonce);

            expect(decrypted).toBeNull();
        });

        test('returns null for tampered ciphertext', () => {
            const key = generateSymmetricKey();
            const plaintext = 'Secret message';

            const { ciphertext, nonce } = encryptSymmetric(key, plaintext);

            // Tamper with ciphertext
            const bytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
            bytes[0] ^= 0xff; // Flip bits
            const tamperedCiphertext = btoa(String.fromCharCode(...bytes));

            const decrypted = decryptSymmetric(key, tamperedCiphertext, nonce);
            expect(decrypted).toBeNull();
        });

        test('returns null for invalid nonce', () => {
            const key = generateSymmetricKey();
            const plaintext = 'Secret message';

            const { ciphertext, nonce } = encryptSymmetric(key, plaintext);

            // Use wrong nonce
            const wrongNonce = btoa('x'.repeat(24));
            const decrypted = decryptSymmetric(key, ciphertext, wrongNonce);

            expect(decrypted).toBeNull();
        });
    });
});
