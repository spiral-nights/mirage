/**
 * Mirage Host - NIP-07 Signer Integration
 *
 * Handles signing requests from the Engine via browser signer extensions.
 */

import type { UnsignedNostrEvent, NostrEvent, Nip07Signer } from '@mirage/core';

export class Signer {
    private signer: Nip07Signer | null = null;
    private pubkey: string | null = null;

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

        if (!this.pubkey) {
            this.pubkey = await this.signer.getPublicKey();
        }

        return this.pubkey!;
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
}
