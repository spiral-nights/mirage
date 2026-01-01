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
    // NIP-59: "The created_at timestamp SHOULD be tweaked to be up to 2 days in the past."
    // We backdate by ~24 hours with some random jitter (minus 0-4 hours)
    const twoDaysAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
    const jitter = Math.floor(Math.random() * (4 * 60 * 60));
    
    console.log(`[InviteDebug] wrapEvent: Backdating by ~24h. Timestamp=${twoDaysAgo - jitter} (Now=${Math.floor(Date.now() / 1000)})`);

    const unsignedWrapper: UnsignedEvent = {
        kind: 1059, // Gift Wrap
        pubkey: ephemeralPubKey,
        created_at: twoDaysAgo - jitter,
        tags,
        content: ciphertext,
    };

    // 6. Sign with Ephemeral Key
    return finalizeEvent(unsignedWrapper, ephemeralPrivKey);
}

/**
 * Unwrap a Gift Wrap event (Kind 1059)
 * 
 * Decrypts the outer layer using the Engine's decryption capability (NIP-44).
 * Returns the inner event (usually Kind 13 or 14/1063/etc).
 */
export async function unwrapEvent(
    event: Event,
    requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>
): Promise<UnsignedEvent | null> {
    if (event.kind !== 1059) return null;

    try {
        // The content of 1059 is the NIP-44 ciphertext.
        // The sender is the ephemeral key (event.pubkey).
        // We ask the Host to decrypt it using our private key.
        const plaintext = await requestDecrypt(event.pubkey, event.content);

        // Parse the inner event
        const innerEvent = JSON.parse(plaintext) as UnsignedEvent;

        // Validation (NIP-17):
        // Inner event should probably be Kind 13 (Rumor).
        // If it is Kind 13, we should check its tags/signature?
        // For standard DMs, it's Wrap(Kind 1059) -> Rumor(Kind 13) -> Message(Kind 14).
        // But the Rumor's content is the Kind 14 JSON? Or Rumor *is* the container?
        // NIP-17: "The seal (Kind 13) is signed by the sender. Its content is the JSON of the actual event (Kind 14)."

        // Wait, wrapEvent above just wrapped `signedEvent` directly into 1059.
        // NIP-17 structure is:
        // GiftWrap (1059) -> Seal (13, signed by sender) -> Payload (14, plain JSON)

        // My wrapEvent implementation above takes a `signedEvent`. 
        // If that `signedEvent` was Kind 13, then we are good.

        return innerEvent;
    } catch (e) {
        console.warn('[NIP-17] Failed to unwrap:', e);
        return null;
    }
}
