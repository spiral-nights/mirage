/**
 * Mirage Host - Authentication & Identity Utilities
 *
 * Helpers for Nostr secret key (nsec) management and validation.
 */

import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { LocalSigner } from './local-signer';

/**
 * Generates a new random Nostr secret key.
 * @returns Uint8Array secret key
 */
export function createNewSecretKey(): Uint8Array {
    return generateSecretKey();
}

/**
 * Encodes a secret key (Uint8Array) to nsec string.
 */
export function encodeNsec(sk: Uint8Array): string {
    return nip19.nsecEncode(sk);
}

/**
 * Decodes an nsec string to secret key (Uint8Array).
 */
export function decodeNsec(nsec: string): Uint8Array {
    const { type, data } = nip19.decode(nsec);
    if (type !== 'nsec') {
        throw new Error('Invalid nsec: wrong type');
    }
    return data as Uint8Array;
}

/**
 * Validates if a string is a valid nsec or hex secret key.
 * Returns the decoded Uint8Array if valid, null otherwise.
 */
export function validateAndDecodeKey(key: string): Uint8Array | null {
    try {
        if (key.startsWith('nsec1')) {
            return decodeNsec(key);
        }
        // Try hex
        if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
            // Convert hex to Uint8Array manually
            const bytes = new Uint8Array(32);
            for (let i = 0; i < 32; i++) {
                bytes[i] = parseInt(key.substring(i * 2, i * 2 + 2), 16);
            }
            return bytes;
        }
    } catch (e) {
        // Ignore validation errors
    }
    return null;
}

/**
 * Formats a pubkey for display (short version).
 */
export function formatPubkey(pubkey: string): string {
    if (!pubkey) return '';
    return `${pubkey.slice(0, 8)}...${pubkey.slice(-8)}`;
}

/**
 * Injects a LocalSigner into window.nostr.
 */
export function injectSigner(sk: Uint8Array): LocalSigner {
    const signer = new LocalSigner(sk);
    (window as any).nostr = signer;
    return signer;
}

/**
 * Derives the pubkey from a secret key.
 */
export { getPublicKey };