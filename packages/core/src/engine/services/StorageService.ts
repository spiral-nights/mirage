import { SimplePool, type Filter, type Event } from 'nostr-tools';
import { UnsignedNostrEvent } from '../../types';
import { SYSTEM_APP_ORIGIN } from '../keys';

export interface StorageServiceContext {
    pool: SimplePool;
    relays: string[];
    requestSign: (event: UnsignedNostrEvent) => Promise<Event>;
    requestEncrypt: (pubkey: string, plaintext: string) => Promise<string>;
    requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>;
    currentPubkey: string | null;
    appOrigin: string;
    currentSpace?: {
        id: string;
        name: string;
        owner?: string;
        members?: string[];
    };
}

export class StorageService {
    private ctx: StorageServiceContext;

    constructor(
        pool: SimplePool,
        relays: string[],
        requestSign: (event: UnsignedNostrEvent) => Promise<Event>,
        requestEncrypt: (pubkey: string, plaintext: string) => Promise<string>,
        requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>,
        currentPubkey: string | null,
        appOrigin: string,
        currentSpace?: { id: string; name: string }
    ) {
        this.ctx = {
            pool,
            relays,
            requestSign,
            requestEncrypt,
            requestDecrypt,
            currentPubkey,
            appOrigin,
            currentSpace
        };
    }

    public updateContext(updates: Partial<StorageServiceContext>) {
        this.ctx = { ...this.ctx, ...updates };
    }

    /**
     * Get value from storage
     */
    public async getStorage(key: string, targetPubkey?: string): Promise<any | null> {
        if (!this.ctx.currentPubkey && !targetPubkey) throw new Error("Not authenticated");

        const isSystemStorage = this.ctx.appOrigin === SYSTEM_APP_ORIGIN;
        if (!isSystemStorage && !this.ctx.currentSpace?.id) {
            throw new Error("Space context required for storage operations");
        }

        const author = targetPubkey || this.ctx.currentPubkey!;
        const dTag = isSystemStorage
            ? `${this.ctx.appOrigin}:${key}`
            : `${this.ctx.appOrigin}:${this.ctx.currentSpace!.id}:${key}`;

        const filter: Filter = {
            kinds: [30078],
            authors: [author],
            "#d": [dTag],
            limit: 1,
        };

        const event = await this.ctx.pool.get(this.ctx.relays, filter);
        if (!event) return null;

        const content = event.content;

        // 1. Try JSON
        try {
            return JSON.parse(content);
        } catch { }

        // 2. Try Decrypt
        if (this.ctx.currentPubkey === author) {
            try {
                const plaintext = await this.ctx.requestDecrypt(this.ctx.currentPubkey, content);
                try {
                    return JSON.parse(plaintext);
                } catch {
                    return plaintext;
                }
            } catch { }
        }

        // 3. Return Raw
        return content;
    }

    /**
     * Put value into storage
     */
    public async putStorage(key: string, value: any, isPublic: boolean = false): Promise<Event> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const isSystemStorage = this.ctx.appOrigin === SYSTEM_APP_ORIGIN;
        if (!isSystemStorage && !this.ctx.currentSpace?.id) {
            throw new Error("Space context required for storage operations");
        }

        const dTag = isSystemStorage
            ? `${this.ctx.appOrigin}:${key}`
            : `${this.ctx.appOrigin}:${this.ctx.currentSpace!.id}:${key}`;

        const plaintext = typeof value === "string" ? value : JSON.stringify(value);
        let content = plaintext;

        if (!isPublic) {
            content = await this.ctx.requestEncrypt(this.ctx.currentPubkey, plaintext);
        }

        const unsignedEvent: UnsignedNostrEvent = {
            kind: 30078,
            created_at: Math.floor(Date.now() / 1000),
            tags: [["d", dTag]],
            content: content,
        };

        const signedEvent = await this.ctx.requestSign(unsignedEvent);
        await Promise.any(this.ctx.pool.publish(this.ctx.relays, signedEvent));

        return signedEvent;
    }

    /**
     * Delete value from storage
     */
    public async deleteStorage(key: string): Promise<boolean> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const isSystemStorage = this.ctx.appOrigin === SYSTEM_APP_ORIGIN;
        if (!isSystemStorage && !this.ctx.currentSpace?.id) {
            throw new Error("Space context required for storage operations");
        }

        const dTag = isSystemStorage
            ? `${this.ctx.appOrigin}:${key}`
            : `${this.ctx.appOrigin}:${this.ctx.currentSpace!.id}:${key}`;

        // Encrypt tombstone content
        let ciphertext: string;
        try {
            ciphertext = await this.ctx.requestEncrypt(this.ctx.currentPubkey, "");
        } catch {
            throw new Error("Failed to encrypt deletion marker");
        }

        const unsignedEvent: UnsignedNostrEvent = {
            kind: 30078,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["d", dTag],
                ["deleted", "true"],
            ],
            content: ciphertext,
        };

        const signedTombstone = await this.ctx.requestSign(unsignedEvent);
        await Promise.any(this.ctx.pool.publish(this.ctx.relays, signedTombstone));

        // Kind 5
        const deletionEvent: UnsignedNostrEvent = {
            kind: 5,
            created_at: Math.floor(Date.now() / 1000) + 5,
            content: "Deleted by Mirage",
            tags: [["a", `30078:${this.ctx.currentPubkey}:${dTag}`]],
        };

        const signedDeletion = await this.ctx.requestSign(deletionEvent);
        await Promise.any(this.ctx.pool.publish(this.ctx.relays, signedDeletion));

        return true;
    }
}
