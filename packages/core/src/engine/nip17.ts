/**
 * NIP-17 / NIP-59 Helper
 * 
 * Implements Gift Wrap (Kind 1059) creation for secure invites.
 * Uses ephemeral keys to wrap events for specific recipients.
 */

import { generateSecretKey, getPublicKey, finalizeEvent, type Event, type UnsignedEvent } from 'nostr-tools';
import { nip44 } from 'nostr-tools';

/**
 * Wraps a signed event into a NIP-59 Gift Wrap (Kind 1059).
 * 
 * @param signedEvent The event to wrap (must be already signed by the real sender)
 * @param receiverPubkey The public key of the recipient
 * @returns A signed Kind 1059 event (signed by a random ephemeral key)
 */
export function wrapEvent(signedEvent: Event, receiverPubkey: string): Event {
    // 1. Generate Ephemeral Key
    const ephemeralPrivKey = generateSecretKey();
    const ephemeralPubKey = getPublicKey(ephemeralPrivKey);

    // 2. Serialize the inner event
    const innerJson = JSON.stringify(signedEvent);

    // 3. Encrypt for Receiver using NIP-44 v2
    // We use the ephemeral private key and receiver's public key
    const conversationKey = nip44.v2.utils.getConversationKey(ephemeralPrivKey, receiverPubkey);
    const ciphertext = nip44.v2.encrypt(innerJson, conversationKey);

    // 4. Create proper NIP-59 tags
    // NIP-59 says: tags should NOT include 'p' in cleartext to avoid metadata leaks?
    // Actually, NIP-59 says "The 'p' tag MUST be present" but often it's the *only* visible metadata.
    // Wait, recent NIP-59 spec says "p" tag is required for relays to route.
    const tags = [['p', receiverPubkey]];

    // 5. Create Unsigned Wrapper
    const unsignedWrapper: UnsignedEvent = {
        kind: 1059, // Gift Wrap
        pubkey: ephemeralPubKey,
        created_at: Math.floor(Date.now() / 1000), // Randomize timestamp slightly? NIP-59 recommends it.
        tags,
        content: ciphertext,
    };

    // 6. Sign with Ephemeral Key
    // finalizeEvent takes (event, secretKey)
    return finalizeEvent(unsignedWrapper, ephemeralPrivKey);
}
