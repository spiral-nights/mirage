/**
 * Mirage Host - NIP-07 Signer Integration
 *
 * Handles signing requests from the Engine via browser signer extensions.
 */

import type { UnsignedNostrEvent, NostrEvent, Nip07Signer } from '@mirage/core';

export class Signer {
    private signer: Nip07Signer | null = null;
    private pubkey: string | null = null;
    private pendingPubKeyRequest: Promise<string> | null = null;

    constructor(signer?: Nip07Signer) {
        this.signer = signer ?? (window as Window & { nostr?: Nip07Signer }).nostr ?? null;
    }

    /**
     * Check if a signer is available
     */
    isAvailable(): boolean {
        return this.signer !== null;
    }

    /**
     * Get the current user's public key
     */
    async getPublicKey(): Promise<string> {
        if (!this.signer) {
            throw new Error('No signer available');
        }

        if (this.pubkey) return this.pubkey;

        // If a request is already in flight, wait for it
        if (this.pendingPubKeyRequest) {
            return this.pendingPubKeyRequest;
        }

        this.pendingPubKeyRequest = (async () => {
            try {
                this.pubkey = await this.signer!.getPublicKey();
                return this.pubkey;
            } finally {
                this.pendingPubKeyRequest = null;
            }
        })();

        return this.pendingPubKeyRequest;
    }

    /**
     * Sign an event
     */
    async signEvent(event: UnsignedNostrEvent): Promise<NostrEvent> {
        if (!this.signer) {
            throw new Error('No signer available');
        }

        // Ensure pubkey is set
        const pubkey = await this.getPublicKey();

        const eventWithPubkey = {
            ...event,
            pubkey,
        };

        return this.signer.signEvent(eventWithPubkey);
    }

    /**
     * Encrypt data using NIP-44 (preferred) or NIP-04 (fallback)
     */
    async encrypt(recipientPubkey: string, plaintext: string): Promise<string> {
        if (!this.signer) {
            throw new Error('No signer available');
        }

        // Prefer NIP-44, fall back to NIP-04
        if (this.signer.nip44?.encrypt) {
            return this.signer.nip44.encrypt(recipientPubkey, plaintext);
        } else if (this.signer.nip04?.encrypt) {
            console.warn('[Signer] NIP-44 not available, falling back to NIP-04');
            return this.signer.nip04.encrypt(recipientPubkey, plaintext);
        }

        throw new Error('Signer does not support encryption (NIP-44 or NIP-04)');
    }

    /**
     * Decrypt data using NIP-44 (preferred) or NIP-04 (fallback)
     */
    async decrypt(senderPubkey: string, ciphertext: string): Promise<string> {
        if (!this.signer) {
            throw new Error('No signer available');
        }

        // Prefer NIP-44, fall back to NIP-04
        if (this.signer.nip44?.decrypt) {
            return this.signer.nip44.decrypt(senderPubkey, ciphertext);
        } else if (this.signer.nip04?.decrypt) {
            console.warn('[Signer] NIP-44 not available, falling back to NIP-04');
            return this.signer.nip04.decrypt(senderPubkey, ciphertext);
        }

        throw new Error('Signer does not support decryption (NIP-44 or NIP-04)');
    }
}
