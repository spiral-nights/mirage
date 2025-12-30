/**
 * Mirage Core - Relay Pool
 *
 * Manages WebSocket connections to Nostr relays with dynamic add/remove support.
 */

import { Relay, type Filter, type Event } from 'nostr-tools';
import type { RelayStat } from '../types';

export interface RelayPoolOptions {
    relays: string[];
}

type RelayStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export class RelayPool {
    private relays: Map<string, Relay> = new Map();
    private connecting: Map<string, Promise<Relay>> = new Map();
    private statuses: Map<string, RelayStatus> = new Map();

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
        if (this.relays.has(url)) return;

        if (this.connecting.has(url)) {
            try {
                await this.connecting.get(url);
            } catch {
                // Ignore
            }
            return;
        }

        this.statuses.set(url, 'connecting');

        const connectPromise = (async () => {
            try {
                const relay = await Relay.connect(url);

                // Add listeners for connection drops if supported by the library wrapper
                // For now, we assume connected if connect() resolves.

                this.relays.set(url, relay);
                this.connecting.delete(url);
                this.statuses.set(url, 'connected');
                console.log(`[RelayPool] Connected to ${url}`);
                return relay;
            } catch (error) {
                this.connecting.delete(url);
                this.statuses.set(url, 'error');
                console.error(`[RelayPool] Failed to connect to ${url}:`, error);
                throw error;
            }
        })();

        this.connecting.set(url, connectPromise);

        try {
            await connectPromise;
        } catch {
            // Already handled
        }
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
        this.statuses.delete(url);
    }

    /**
     * Set relays (replaces all current relays)
     */
    async setRelays(urls: string[]): Promise<void> {
        const currentUrls = new Set([...this.relays.keys(), ...this.connecting.keys(), ...this.statuses.keys()]);

        // Remove relays not in new list
        for (const url of currentUrls) {
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
     * Get stats for all tracked relays
     */
    getStats(): RelayStat[] {
        return Array.from(this.statuses.entries()).map(([url, status]) => ({
            url,
            status
        }));
    }

    /**
     * Query for a single event matching filters.
     * For replaceable events, returns the newest event by created_at across all relays.
     */
    async query(filters: Filter[], timeout = 3000): Promise<Event | null> {
        // Use queryAll to get events from all relays, then pick the newest
        const events = await this.queryAll(filters, timeout);

        if (events.length === 0) {
            return null;
        }

        // Return the newest event by created_at (important for replaceable kinds)
        return events.reduce((newest, current) =>
            current.created_at > newest.created_at ? current : newest
        );
    }

    /**
     * Query for all events matching filters from all relays.
     * Resolves when all relays have sent EOSE or after a timeout.
     */
    async queryAll(filters: Filter[], timeout = 3000): Promise<Event[]> {
        return new Promise((resolve) => {
            const events: Event[] = [];
            const eoseReceived = new Set<string>();
            let resolved = false;

            const unsub = this.subscribe(
                filters,
                (event) => {
                    if (!resolved) {
                        // Deduplicate by ID
                        if (!events.some(e => e.id === event.id)) {
                            events.push(event);
                        }
                    }
                },
                (relayUrl) => {
                    if (!resolved) {
                        eoseReceived.add(relayUrl);
                        if (eoseReceived.size >= this.relays.size) {
                            resolved = true;
                            unsub();
                            resolve(events);
                        }
                    }
                }
            );

            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    unsub();
                    resolve(events);
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
        onEose?: (relayUrl: string) => void
    ): () => void {
        const subscriptions: Array<{ close: () => void }> = [];

        for (const [url, relay] of this.relays.entries()) {
            const sub = relay.subscribe(filters, {
                onevent: onEvent,
                oneose: () => onEose?.(url),
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
        this.statuses.clear();
    }
}
