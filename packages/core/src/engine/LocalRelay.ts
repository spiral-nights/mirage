/**
 * LocalRelay - An in-browser Nostr relay backed by IndexedDB
 * 
 * Extends AbstractRelay from nostr-tools to provide local storage capability.
 * All data is stored in IndexedDB using Dexie, with support for NIP-09 deletion.
 */

import Dexie from 'dexie';
import { AbstractRelay, type Subscription, type SubscriptionParams } from 'nostr-tools/abstract-relay';
import { matchFilters, type Filter } from 'nostr-tools/filter';
import { verifyEvent, type Event } from 'nostr-tools/pure';

// =============================================================================
// IndexedDB Schema
// =============================================================================

class LocalEventStore extends Dexie {
  events!: Dexie.Table<Event, string>;

  constructor() {
    super('mirage-local-events');
    this.version(1).stores({
      events: 'id, kind, pubkey, created_at'
    });
  }
}

// =============================================================================
// LocalRelay Class - Extends AbstractRelay
// =============================================================================

/**
 * LocalRelay extends AbstractRelay but replaces WebSocket with IndexedDB storage.
 * It implements the same interface so SimplePool can use it seamlessly.
 */
export class LocalRelay extends AbstractRelay {
  private db: LocalEventStore;
  private localConnected: boolean = false;
  private localSerial: number = 0;
  private localSubs: Map<string, LocalSubscription> = new Map();

  constructor() {
    // Call AbstractRelay constructor with local URL and verifyEvent
    super('mirage://local', {
      verifyEvent: verifyEvent as any,
    });
    this.db = new LocalEventStore();
  }

  /**
   * Connect - for local relay, this just sets connected flag
   */
  async connect(): Promise<void> {
    this.localConnected = true;
    return Promise.resolve();
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.localConnected;
  }

  /**
   * Publish an event to local storage
   * Handles NIP-09 deletion events
   */
  async publish(event: Event): Promise<string> {
    // Handle NIP-09 deletion events (kind 5)
    if (event.kind === 5) {
      await this.handleDeletion(event);
      return 'deleted';
    }

    // Handle Replaceable Events (NIP-01, NIP-33)
    if (
      event.kind === 0 ||
      event.kind === 3 ||
      (event.kind >= 10000 && event.kind < 20000) ||
      (event.kind >= 30000 && event.kind < 40000)
    ) {
      await this.handleReplaceable(event);
    }

    // Store the event
    await this.db.events.put(event);

    // Notify any open subscriptions
    for (const [, sub] of this.localSubs) {
      if (matchFilters(sub.filters, event)) {
        sub.onevent(event);
      }
    }

    return 'ok';
  }

  /**
   * Handle NIP-09 deletion event
   */
  private async handleDeletion(deleteEvent: Event): Promise<void> {
    const eventIdsToDelete: string[] = [];

    for (const tag of deleteEvent.tags) {
      if (tag[0] === 'e' && tag[1]) {
        eventIdsToDelete.push(tag[1]);
      }
    }

    if (eventIdsToDelete.length === 0) return;

    // Only delete events from the same author
    await this.db.events
      .where('id')
      .anyOf(eventIdsToDelete)
      .filter(event => event.pubkey === deleteEvent.pubkey)
      .delete();

    // Store the deletion event
    await this.db.events.put(deleteEvent);
  }

  /**
   * Handle Replaceable Events: delete older versions
   */
  private async handleReplaceable(event: Event): Promise<void> {
    const isParameterized = event.kind >= 30000 && event.kind < 40000;
    let dTag: string | undefined;

    if (isParameterized) {
      dTag = event.tags.find(t => t[0] === 'd')?.[1];
      // If no d tag, it's considered empty string d tag? NIP-33 says yes.
      if (dTag === undefined) dTag = '';
    }

    let collection = this.db.events
      .where('kind').equals(event.kind)
      .filter(e => e.pubkey === event.pubkey);

    const oldEvents = await collection.toArray();
    const toDelete: string[] = [];

    for (const old of oldEvents) {
      // For parameterized, check d tag match
      if (isParameterized) {
        const oldD = old.tags.find(t => t[0] === 'd')?.[1] || '';
        // If d tag matches (or both empty), delete
        if (oldD === (dTag || '')) {
          toDelete.push(old.id);
        }
      } else {
        // Regular replaceable: delete all of this kind/pubkey
        toDelete.push(old.id);
      }
    }

    if (toDelete.length > 0) {
      await this.db.events.bulkDelete(toDelete);
    }
  }

  /**
   * Subscribe to events matching filters
   */
  subscribe(
    filters: Filter[],
    params: Partial<SubscriptionParams> & { id?: string; label?: string }
  ): Subscription {
    this.localSerial++;
    const id = params.id || (params.label ? params.label + ':' : 'sub:') + this.localSerial;

    const subscription = new LocalSubscription(this, id, filters, params);
    this.localSubs.set(id, subscription);

    // Fire the subscription (query existing events)
    subscription.fire();

    return subscription as unknown as Subscription;
  }

  /**
   * Query events from IndexedDB
   */
  async queryEvents(filters: Filter[]): Promise<Event[]> {
    const results: Event[] = [];
    const seenIds = new Set<string>();

    for (const filter of filters) {
      const events = await this.queryFilter(filter);
      for (const event of events) {
        if (!seenIds.has(event.id)) {
          seenIds.add(event.id);
          results.push(event);
        }
      }
    }

    return results.sort((a, b) => b.created_at - a.created_at);
  }

  /**
   * Query events matching a single filter
   */
  private async queryFilter(filter: Filter): Promise<Event[]> {
    let collection = this.db.events.toCollection();

    // Filter by IDs
    if (filter.ids && filter.ids.length > 0) {
      collection = this.db.events.where('id').anyOf(filter.ids);
    }

    // Filter by kinds
    if (filter.kinds && filter.kinds.length > 0) {
      collection = collection.filter(e => filter.kinds!.includes(e.kind));
    }

    // Filter by authors
    if (filter.authors && filter.authors.length > 0) {
      collection = collection.filter(e => filter.authors!.includes(e.pubkey));
    }

    // Filter by since
    if (filter.since !== undefined) {
      collection = collection.filter(e => e.created_at >= filter.since!);
    }

    // Filter by until
    if (filter.until !== undefined) {
      collection = collection.filter(e => e.created_at <= filter.until!);
    }

    // Filter by tags
    const tagFilters = Object.entries(filter).filter(([key]) => key.startsWith('#'));
    if (tagFilters.length > 0) {
      collection = collection.filter(event => {
        for (const [key, values] of tagFilters) {
          const tagName = key.slice(1);
          const tagValues = values as string[];
          const eventTagValues = event.tags
            .filter(t => t[0] === tagName)
            .map(t => t[1]);

          if (!tagValues.some(v => eventTagValues.includes(v))) {
            return false;
          }
        }
        return true;
      });
    }

    let results = await collection.toArray();

    // Apply limit
    if (filter.limit && filter.limit > 0) {
      results = results
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, filter.limit);
    }

    return results;
  }

  /**
   * Delete events by d-tag prefix (for space deletion)
   */
  async deleteByDTagPrefix(prefix: string): Promise<void> {
    const eventsToDelete = await this.db.events
      .filter(event => {
        const dTag = event.tags.find(t => t[0] === 'd');
        return Boolean(dTag && dTag[1]?.startsWith(prefix));
      })
      .toArray();

    if (eventsToDelete.length > 0) {
      await this.db.events.bulkDelete(eventsToDelete.map(e => e.id));
    }
  }

  /**
   * Delete events matching a filter (used for space cleanup)
   */
  async deleteByFilter(filter: Filter): Promise<void> {
    const eventsToDelete = await this.queryFilter(filter);
    if (eventsToDelete.length > 0) {
      await this.db.events.bulkDelete(eventsToDelete.map(e => e.id));
    }
  }

  /**
   * Clear all local events
   */
  async clear(): Promise<void> {
    await this.db.events.clear();
  }

  /**
   * Close the relay
   */
  close(): void {
    this.localConnected = false;
    for (const [, sub] of this.localSubs) {
      sub.close('relay closed');
    }
    this.localSubs.clear();
  }

  /**
   * Remove a local subscription (called by LocalSubscription.close)
   */
  removeLocalSub(id: string): void {
    this.localSubs.delete(id);
  }

  /**
   * Send - not used for local relay
   */
  async send(_message: string): Promise<void> {
    // No-op for local relay
  }
}

// =============================================================================
// LocalSubscription - Handles subscriptions for LocalRelay
// =============================================================================

class LocalSubscription {
  public readonly relay: LocalRelay;
  public readonly id: string;
  public readonly filters: Filter[];
  public closed: boolean = false;
  public eosed: boolean = false;

  public onevent: (evt: Event) => void;
  public oneose?: () => void;
  public onclose?: (reason: string) => void;

  constructor(
    relay: LocalRelay,
    id: string,
    filters: Filter[],
    params: Partial<SubscriptionParams>
  ) {
    this.relay = relay;
    this.id = id;
    this.filters = filters;
    this.onevent = params.onevent || (() => { });
    this.oneose = params.oneose;
    this.onclose = params.onclose;
  }

  /**
   * Fire the subscription - query existing events
   */
  async fire(): Promise<void> {
    try {
      const events = await this.relay.queryEvents(this.filters);

      for (const event of events) {
        if (!this.closed) {
          this.onevent(event);
        }
      }

      // Signal EOSE
      if (!this.closed && !this.eosed) {
        this.eosed = true;
        this.oneose?.();
      }
    } catch (err) {
      console.error('[LocalRelay] Query failed:', err);
      this.close(`query error: ${(err as Error).message}`);
    }
  }

  /**
   * Close the subscription
   */
  close(reason: string = 'closed by caller'): void {
    if (this.closed) return;
    this.closed = true;
    this.relay.removeLocalSub(this.id);
    this.onclose?.(reason);
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

let localRelayInstance: LocalRelay | null = null;

export function getLocalRelay(): LocalRelay {
  if (!localRelayInstance) {
    localRelayInstance = new LocalRelay();
  }
  return localRelayInstance;
}
