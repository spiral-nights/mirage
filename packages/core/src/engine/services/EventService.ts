import { SimplePool, type Filter, type Event } from 'nostr-tools';
import { UnsignedNostrEvent } from '../../types';

export interface EventServiceContext {
    pool: SimplePool;
    relays: string[];
    requestSign: (event: UnsignedNostrEvent) => Promise<Event>;
}

export class EventService {
    private ctx: EventServiceContext;

    constructor(
        pool: SimplePool,
        relays: string[],
        requestSign: (event: UnsignedNostrEvent) => Promise<Event>
    ) {
        this.ctx = {
            pool,
            relays,
            requestSign
        };
    }

    public updateContext(updates: Partial<EventServiceContext>) {
        this.ctx = { ...this.ctx, ...updates };
    }

    /**
     * Query events from relays
     */
    public async getEvents(filter: Filter): Promise<Event[]> {
        return this.ctx.pool.querySync(this.ctx.relays, filter);
    }

    /**
     * Publish a raw event
     */
    public async publishEvent(
        partialEvent: { kind: number; content: string; tags?: string[][] },
        targetRelays?: string[]
    ): Promise<Event> {
        const unsignedEvent: UnsignedNostrEvent = {
            kind: partialEvent.kind,
            content: partialEvent.content,
            tags: partialEvent.tags ?? [],
            created_at: Math.floor(Date.now() / 1000),
        };

        const signedEvent = await this.ctx.requestSign(unsignedEvent);
        const targets = targetRelays || this.ctx.relays;

        await Promise.any(this.ctx.pool.publish(targets, signedEvent));

        return signedEvent;
    }
}
