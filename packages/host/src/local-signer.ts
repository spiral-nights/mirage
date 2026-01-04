/**
 * Mirage Host - Local NIP-07 Signer
 *
 * Implements the NIP-07 interface using a local secret key (nsec).
 */

import { 
    getPublicKey, 
    finalizeEvent, 
    nip44, 
    nip04,
    type UnsignedEvent,
    type Event
} from 'nostr-tools';
import type { Nip07Signer, UnsignedNostrEvent, NostrEvent } from '@mirage/core';

export class LocalSigner implements Nip07Signer {
    private sk: Uint8Array;
    private pubkey: string;

    constructor(sk: Uint8Array) {
        this.sk = sk;
        this.pubkey = getPublicKey(sk);
    }

    async getPublicKey(): Promise<string> {
        return this.pubkey;
    }

    async signEvent(event: UnsignedNostrEvent): Promise<NostrEvent> {
        // finalizeEvent handles hashing and signing
        const signed = finalizeEvent(event as UnsignedEvent, this.sk);
        return signed as NostrEvent;
    }

    nip04 = {
        encrypt: async (pubkey: string, plaintext: string): Promise<string> => {
            return nip04.encrypt(this.sk, pubkey, plaintext);
        },
        decrypt: async (pubkey: string, ciphertext: string): Promise<string> => {
            return nip04.decrypt(this.sk, pubkey, ciphertext);
        }
    };

    nip44 = {
        encrypt: async (pubkey: string, plaintext: string): Promise<string> => {
            const conversationKey = nip44.v2.utils.getConversationKey(this.sk, pubkey);
            return nip44.v2.encrypt(plaintext, conversationKey);
        },
        decrypt: async (pubkey: string, ciphertext: string): Promise<string> => {
            const conversationKey = nip44.v2.utils.getConversationKey(this.sk, pubkey);
            return nip44.v2.decrypt(ciphertext, conversationKey);
        }
    };
}
