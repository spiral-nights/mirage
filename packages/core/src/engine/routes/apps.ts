
/**
 * Mirage Apps - Route Handlers
 * 
 * Logic for fetching and publishing Mirage apps (Kind 30078).
 */

import { nip19, type Filter, type SimplePool } from 'nostr-tools';

/**
 * Fetch an app's HTML code from Nostr relays using naddr.
 */
export async function fetchAppCode(
    pool: SimplePool,
    relays: string[],
    naddr: string
): Promise<{ html?: string; error?: string }> {
    try {
        // 1. Decode naddr
        const decoded = nip19.decode(naddr);
        if (decoded.type !== 'naddr') {
            return { error: 'Invalid naddr: Must be an addressable event (Kind 30078)' };
        }

        const { kind, pubkey, identifier } = decoded.data;

        if (kind !== 30078) {
            return { error: 'Invalid kind: Mirage apps must be Kind 30078' };
        }

        // 2. Query Relays
        const filter: Filter = {
            kinds: [30078],
            authors: [pubkey],
            '#d': [identifier],
            limit: 1
        };

        const event = await pool.get(relays, filter);

        if (!event) {
            return { error: 'App not found on relays' };
        }

        // 3. Return content
        return { html: event.content };

    } catch (error) {
        console.error('[Apps] Fetch failed:', error);
        return { error: error instanceof Error ? error.message : 'Unknown fetch error' };
    }
}
