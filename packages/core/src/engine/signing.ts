/**
 * Mirage Engine - Signing Utilities
 *
 * Handles NIP-07 signature requests via Host communication.
 */

import type { Event } from 'nostr-tools';
import type { SignEventMessage, UnsignedNostrEvent } from '../types';

// ============================================================================
// Types
// ============================================================================

interface PendingSignature {
    resolve: (event: Event) => void;
    reject: (error: Error) => void;
}

// ============================================================================
// State
// ============================================================================

export const pendingSignatures = new Map<string, PendingSignature>();

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

        // Timeout after 60 seconds
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
        // Update current pubkey if we don't have it
        if (!currentPubkey && message.signedEvent.pubkey) {
            setCurrentPubkey(message.signedEvent.pubkey);
        }
        pending.resolve(message.signedEvent);
    } else {
        pending.reject(new Error('Invalid signature result'));
    }
}
