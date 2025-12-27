/**
 * Mirage Engine - Event Routes
 *
 * Handles /api/v1/events endpoints for raw Nostr event access.
 */

import type { Filter, Event } from 'nostr-tools';
import type { RelayPool } from '../relay-pool';
import type { UnsignedNostrEvent } from '../../types';

export interface EventsRouteContext {
    pool: RelayPool;
    requestSign: (event: UnsignedNostrEvent) => Promise<Event>;
}

/**
 * GET /api/v1/events - Query events
 */
export async function getEvents(
    ctx: EventsRouteContext,
    params: Record<string, string | string[]>
): Promise<{ status: number; body: Event[] }> {
    const limit = params.limit ? parseInt(String(params.limit), 10) : 20;

    // Construct filter from query params
    const filter: Filter = {
        limit,
    };

    // Parse kinds (comma-separated or array)
    if (params.kinds) {
        const kindsRaw = Array.isArray(params.kinds) ? params.kinds : String(params.kinds).split(',');
        filter.kinds = kindsRaw.map(k => parseInt(k.trim(), 10)).filter(n => !isNaN(n));
    }

    // Parse authors (comma-separated or array)
    if (params.authors) {
        const authorsRaw = Array.isArray(params.authors) ? params.authors : String(params.authors).split(',');
        filter.authors = authorsRaw.map(a => a.trim()).filter(a => a.length > 0);
    }

    // Parse since
    if (params.since) {
        filter.since = parseInt(String(params.since), 10);
    }

    // Parse tags (tags[t]=val or tags=t:val format)
    // Simplified support: ?tags=t:nostr,p:pubkey
    if (params.tags) {
        const tagsRaw = Array.isArray(params.tags) ? params.tags : String(params.tags).split(',');
        tagsRaw.forEach(tagStr => {
            const [key, value] = tagStr.trim().split(':');
            if (key && value) {
                const tagName = `#${key}`;
                if (!(filter as any)[tagName]) {
                    (filter as any)[tagName] = [];
                }
                ((filter as any)[tagName] as string[]).push(value);
            }
        });
    }

    const events = await ctx.pool.queryAll([filter], 5000);
    return { status: 200, body: events };
}

/**
 * POST /api/v1/events - Publish a raw event
 */
export async function postEvents(
    ctx: EventsRouteContext,
    body: { kind: number; content: string; tags?: string[][] }
): Promise<{ status: number; body: Event | { error: string } }> {
    if (body.kind === undefined || body.content === undefined) {
        return { status: 400, body: { error: 'Missing kind or content' } };
    }

    const unsignedEvent: UnsignedNostrEvent = {
        kind: body.kind,
        content: body.content,
        tags: body.tags ?? [],
        created_at: Math.floor(Date.now() / 1000),
    };

    try {
        const signedEvent = await ctx.requestSign(unsignedEvent);
        await ctx.pool.publish(signedEvent);

        return {
            status: 201,
            body: signedEvent,
        };
    } catch (error) {
        return {
            status: 500,
            body: { error: error instanceof Error ? error.message : 'Failed to publish event' },
        };
    }
}
