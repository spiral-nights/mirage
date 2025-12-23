/**
 * Mirage Engine - Signing & Encryption Utilities
 *
 * Handles NIP-07 signature and NIP-44 encryption requests via Host communication.
 */

import type { Event } from 'nostr-tools';
import type { SignEventMessage, EncryptRequestMessage, DecryptRequestMessage, UnsignedNostrEvent } from '../types';

// ============================================================================
// Types
// ============================================================================

interface PendingRequest<T> {
    resolve: (result: T) => void;
    reject: (error: Error) => void;
}

// ============================================================================
// State
// ============================================================================

export const pendingSignatures = new Map<string, PendingRequest<Event>>();
export const pendingEncryptions = new Map<string, PendingRequest<string>>();
export const pendingDecryptions = new Map<string, PendingRequest<string>>();

// ============================================================================
// UUID Helper
// ============================================================================

function generateUUID(): string {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback: generate UUID v4 using crypto.getRandomValues
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// ============================================================================
// Sign Request
// ============================================================================

/**
 * Request a signature from the Host via NIP-07
 */
export function requestSign(event: UnsignedNostrEvent): Promise<Event> {
    return new Promise((resolve, reject) => {
        const id = generateUUID();

        pendingSignatures.set(id, { resolve, reject });

        const message: SignEventMessage = {
            type: 'ACTION_SIGN_EVENT',
            id,
            event,
        };

        self.postMessage(message);

        setTimeout(() => {
            if (pendingSignatures.has(id)) {
                pendingSignatures.delete(id);
                reject(new Error('Signing request timed out'));
            }
        }, 60000);
    });
}

/**
 * Handle signature result from Host
 */
export function handleSignatureResult(
    message: { id: string; signedEvent?: Event; error?: string },
    setCurrentPubkey: (pubkey: string) => void,
    currentPubkey: string | null
): void {
    const pending = pendingSignatures.get(message.id);
    if (!pending) {
        console.warn('[Engine] Received signature for unknown request:', message.id);
        return;
    }

    pendingSignatures.delete(message.id);

    if (message.error) {
        pending.reject(new Error(message.error));
    } else if (message.signedEvent) {
        if (!currentPubkey && message.signedEvent.pubkey) {
            setCurrentPubkey(message.signedEvent.pubkey);
        }
        pending.resolve(message.signedEvent);
    } else {
        pending.reject(new Error('Invalid signature result'));
    }
}

// ============================================================================
// NIP-44 Encryption
// ============================================================================

/**
 * Request NIP-44 encryption from Host
 * For self-encryption, pass the user's own pubkey
 */
export function requestEncrypt(pubkey: string, plaintext: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const id = generateUUID();

        pendingEncryptions.set(id, { resolve, reject });

        const message: EncryptRequestMessage = {
            type: 'ACTION_ENCRYPT',
            id,
            pubkey,
            plaintext,
        };

        self.postMessage(message);

        setTimeout(() => {
            if (pendingEncryptions.has(id)) {
                pendingEncryptions.delete(id);
                reject(new Error('Encryption request timed out'));
            }
        }, 30000);
    });
}

/**
 * Handle encryption result from Host
 */
export function handleEncryptResult(
    message: { id: string; ciphertext?: string; error?: string }
): void {
    const pending = pendingEncryptions.get(message.id);
    if (!pending) return;

    pendingEncryptions.delete(message.id);

    if (message.error) {
        pending.reject(new Error(message.error));
    } else if (message.ciphertext) {
        pending.resolve(message.ciphertext);
    } else {
        pending.reject(new Error('Invalid encryption result'));
    }
}

/**
 * Request NIP-44 decryption from Host
 */
export function requestDecrypt(pubkey: string, ciphertext: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const id = generateUUID();

        pendingDecryptions.set(id, { resolve, reject });

        const message: DecryptRequestMessage = {
            type: 'ACTION_DECRYPT',
            id,
            pubkey,
            ciphertext,
        };

        self.postMessage(message);

        setTimeout(() => {
            if (pendingDecryptions.has(id)) {
                pendingDecryptions.delete(id);
                reject(new Error('Decryption request timed out'));
            }
        }, 30000);
    });
}

/**
 * Handle decryption result from Host
 */
export function handleDecryptResult(
    message: { id: string; plaintext?: string; error?: string }
): void {
    const pending = pendingDecryptions.get(message.id);
    if (!pending) return;

    pendingDecryptions.delete(message.id);

    if (message.error) {
        pending.reject(new Error(message.error));
    } else if (message.plaintext) {
        pending.resolve(message.plaintext);
    } else {
        pending.reject(new Error('Invalid decryption result'));
    }
}
