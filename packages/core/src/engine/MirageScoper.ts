/**
 * MirageScoper
 * 
 * Centralized utility for constructing Nostr identifiers (d-tags, scoped IDs)
 * based on app origin and space context.
 */

import { SYSTEM_APP_ORIGIN } from "./keys";

export class MirageScoper {
    /**
     * Get the d-tag for NIP-78 personal storage.
     * Format: {origin}:{spaceId}:{key} or {origin}:{key}
     */
    static getStorageDTag(origin: string, spaceId: string | undefined, key: string): string {
        if (origin === SYSTEM_APP_ORIGIN) {
            return `${SYSTEM_APP_ORIGIN}:${key}`;
        }

        return spaceId
            ? `${origin}:${spaceId}:${key}`
            : `${origin}:${key}`;
    }

    /**
     * Get the scoped ID for a Space.
     * Format: {origin}:{spaceId}
     */
    static getSpaceScopedId(origin: string, spaceId: string): string {
        return `${origin}:${spaceId}`;
    }

    /**
     * Get a system-level d-tag.
     * Format: mirage:{key}
     */
    static getInternalDTag(key: string): string {
        return `${SYSTEM_APP_ORIGIN}:${key}`;
    }

    /**
     * Parse a scoped ID into its origin and spaceId parts.
     */
    static parseScopedId(scopedId: string): { origin: string; spaceId: string } | null {
        const colonIndex = scopedId.lastIndexOf(":");
        if (colonIndex === -1) return null;

        return {
            origin: scopedId.slice(0, colonIndex),
            spaceId: scopedId.slice(colonIndex + 1)
        };
    }
}
