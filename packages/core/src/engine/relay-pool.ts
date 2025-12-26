/**
 * Mirage Core - Relay Pool
 *
 * Manages WebSocket connections to Nostr relays with dynamic add/remove support.
 */

import { Relay, type Filter, type Event } from 'nostr-tools';

export interface RelayPoolOptions {
    relays: string[];
}

export class RelayPool {
    private relays: Map<string, Relay> = new Map();
    private connecting: Map<string, Promise<Relay>> = new Map();

    constructor(options?: RelayPoolOptions) {
        if (options?.relays) {
            for (const url of options.relays) {
                this.addRelay(url);
            }
        }
    }

    /**
     * Add a relay to the pool
     */
    async addRelay(url: string): Promise<void> {
        if (this.relays.has(url) || this.connecting.has(url)) {
            return;
        }

        const connectPromise = (async () => {
            try {
                const relay = await Relay.connect(url);
                this.relays.set(url, relay);
                this.connecting.delete(url);
                console.log(`[RelayPool] Connected to ${url}`);
                return relay;
            } catch (error) {
                this.connecting.delete(url);
                console.error(`[RelayPool] Failed to connect to ${url}:`, error);
                throw error;
            }
        })();

        this.connecting.set(url, connectPromise);
        await connectPromise;
    }

    /**
     * Remove a relay from the pool
     */
    removeRelay(url: string): void {
        const relay = this.relays.get(url);
        if (relay) {
            relay.close();
            this.relays.delete(url);
            console.log(`[RelayPool] Disconnected from ${url}`);
        }
        this.connecting.delete(url);
    }

    /**
     * Set relays (replaces all current relays)
     */
    async setRelays(urls: string[]): Promise<void> {
        // Remove relays not in new list
        for (const url of this.relays.keys()) {
            if (!urls.includes(url)) {
                this.removeRelay(url);
            }
        }

        // Add new relays
        await Promise.allSettled(urls.map((url) => this.addRelay(url)));
    }

    /**
     * Get all connected relay URLs
     */
    getRelays(): string[] {
        return Array.from(this.relays.keys());
    }

    /**
     * Query for a single event matching filters
     */
    async query(filters: Filter[], timeout = 5000): Promise<Event | null> {
        return new Promise((resolve) => {
            let resolved = false;
            const unsub = this.subscribe(
                filters,
                (event) => {
                    if (!resolved) {
                        resolved = true;
                        unsub();
                        resolve(event);
                    }
                }
            );

            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    unsub();
                    resolve(null);
                }
            }, timeout);
        });
    }

    /**
     * Subscribe to events matching filters
     */
    subscribe(
        filters: Filter[],
        onEvent: (event: Event) => void,
        onEose?: () => void
    ): () => void {
        const subscriptions: Array<{ close: () => void }> = [];

        for (const relay of this.relays.values()) {
            const sub = relay.subscribe(filters, {
                onevent: onEvent,
                oneose: onEose,
            });
            subscriptions.push(sub);
        }

        // Return unsubscribe function
        return () => {
            for (const sub of subscriptions) {
                sub.close();
            }
        };
    }

    /**
     * Publish an event to all relays
     * Returns successfully if at least one relay accepts the event
     */
    async publish(event: Event): Promise<void> {
        if (this.relays.size === 0) {
            console.error('[RelayPool] Cannot publish: No connected relays');
            throw new Error('No connected relays');
        }

        console.log(`[RelayPool] Publishing event kind=${event.kind} id=${event.id?.slice(0, 8)}... to ${this.relays.size} relays`);

        const results = await Promise.allSettled(
            Array.from(this.relays.entries()).map(async ([url, relay]) => {
                try {
                    await relay.publish(event);
                    console.log(`[RelayPool] ✓ Published to ${url}`);
                    return { url, success: true };
                } catch (error) {
                    const errorMsg = error instanceof Error ? error.message : String(error);
                    console.warn(`[RelayPool] ✗ Failed to publish to ${url}: ${errorMsg}`);
                    return { url, success: false, error: errorMsg };
                }
            })
        );

        const successes = results.filter(
            (r): r is PromiseFulfilledResult<{ url: string; success: true }> =>
                r.status === 'fulfilled' && r.value.success
        );
        const failures = results.filter(
            (r): r is PromiseFulfilledResult<{ url: string; success: false; error: string }> =>
                r.status === 'fulfilled' && !r.value.success
        );

        console.log(`[RelayPool] Publish complete: ${successes.length}/${this.relays.size} relays accepted`);

        if (successes.length === 0) {
            const errorDetails = failures.map(f => `${f.value.url}: ${f.value.error}`).join('; ');
            throw new Error(`All relays rejected the event: ${errorDetails}`);
        }
    }

    /**
     * Close all relay connections
     */
    close(): void {
        for (const relay of this.relays.values()) {
            relay.close();
        }
        this.relays.clear();
        this.connecting.clear();
    }
}
