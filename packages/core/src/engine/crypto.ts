/**
 * Mirage Engine - Cryptography Helpers
 * 
 * Provides symmetric encryption primitives using XChaCha20-Poly1305.
 * Used for channel message encryption.
 */

import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { bytesToHex, hexToBytes } from '@noble/ciphers/utils.js';

// XChaCha20-Poly1305 constants
const KEY_LENGTH = 32;
const NONCE_LENGTH = 24;

/**
 * Generates a random 32-byte symmetric key using CSPRNG.
 * @returns Base64 encoded key
 */
export function generateSymmetricKey(): string {
    const key = new Uint8Array(KEY_LENGTH);
    crypto.getRandomValues(key);
    return bytesToBase64(key);
}

/**
 * Generates a random 32-byte hex string (valid for Nostr IDs).
 */
export function generateRandomId(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
}

/**
 * Encrypts plaintext using XChaCha20-Poly1305.
 * @param keyBase64 Base64 encoded 32-byte key
 * @param plaintext Plaintext string
 * @returns Object with Base64 ciphertext and nonce
 */
export function encryptSymmetric(keyBase64: string, plaintext: string): { ciphertext: string; nonce: string } {
    const key = base64ToBytes(keyBase64);
    if (key.length !== KEY_LENGTH) throw new Error(`Invalid key length: ${key.length}`);

    const nonce = new Uint8Array(NONCE_LENGTH);
    crypto.getRandomValues(nonce);

    const message = new TextEncoder().encode(plaintext);
    const ciphertext = xchacha20poly1305(key, nonce).encrypt(message);

    return {
        ciphertext: bytesToBase64(ciphertext),
        nonce: bytesToBase64(nonce)
    };
}

/**
 * Decrypts ciphertext using XChaCha20-Poly1305.
 * @param keyBase64 Base64 encoded 32-byte key
 * @param ciphertextBase64 Base64 encoded ciphertext
 * @param nonceBase64 Base64 encoded 24-byte nonce
 * @returns Decrypted plaintext string
 */
export function decryptSymmetric(keyBase64: string, ciphertextBase64: string, nonceBase64: string): string | null {
    try {
        const key = base64ToBytes(keyBase64);
        if (key.length !== KEY_LENGTH) throw new Error(`Invalid key length: ${key.length}`);

        const nonce = base64ToBytes(nonceBase64);
        if (nonce.length !== NONCE_LENGTH) throw new Error(`Invalid nonce length: ${nonce.length}`);

        const ciphertext = base64ToBytes(ciphertextBase64);

        const decrypted = xchacha20poly1305(key, nonce).decrypt(ciphertext);
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error('[Crypto] Decryption failed:', e);
        return null;
    }
}

// Helpers for Base64 <-> Uint8Array
// Using generic approach for browser compatibility
function bytesToBase64(bytes: Uint8Array): string {
    const binString = Array.from(bytes, (byte) =>
        String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
}

function base64ToBytes(base64: string): Uint8Array {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}
