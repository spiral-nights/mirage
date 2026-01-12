import { SimplePool, type Filter, nip19 } from 'nostr-tools';
import type {
    UnsignedNostrEvent,
    Space,
    SpaceMessage,
    SpaceKey,
    NostrEvent
} from '../../types';
import {
    generateSymmetricKey,
    encryptSymmetric,
    decryptSymmetric,
    generateRandomId
} from '../crypto';
import { loadSpaceKeys, saveSpaceKeys } from '../keys';
// We need to move wrapEvent to a shared utility or keep it imported
import { wrapEvent } from '../nip17';

export interface SpaceServiceContext {
    pool: SimplePool;
    relays: string[];
    currentPubkey: string | null;
    appOrigin: string; // The origin identifier of the app using this service
    requestSign: (event: UnsignedNostrEvent) => Promise<NostrEvent>;
    requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>;
    requestEncrypt?: (pubkey: string, plaintext: string) => Promise<string>;
    currentSpace?: { id: string; name: string };
}

export class SpaceService {
    private ctx: SpaceServiceContext;
    private keyCache: Map<string, SpaceKey> | null = null;

    // In-memory cache for KV Store Snapshots
    private storeCache = new Map<string, {
        state: Map<string, { value: unknown; updatedAt: number }>;
        latestTimestamp: number;
    }>();

    constructor(config: SpaceServiceContext) {
        this.ctx = {
            ...config,
            requestEncrypt: config.requestEncrypt || (async () => { throw new Error("Encryption provider missing"); })
        };
    }

    /**
     * Updates context (e.g. when relays or pubkey change)
     */
    updateContext(patches: Partial<SpaceServiceContext>) {
        this.ctx = { ...this.ctx, ...patches };
        // Invalidate key cache if pubkey or appOrigin changes
        if (
            (patches.currentPubkey && patches.currentPubkey !== this.ctx.currentPubkey) ||
            (patches.appOrigin && patches.appOrigin !== this.ctx.appOrigin)
        ) {
            this.keyCache = null;
        }
    }

    private async getKeys(): Promise<Map<string, SpaceKey>> {
        if (!this.keyCache) {
            this.keyCache = await loadSpaceKeys({
                pool: this.ctx.pool,
                relays: this.ctx.relays,
                currentPubkey: this.ctx.currentPubkey,
                requestSign: this.ctx.requestSign,
                requestDecrypt: this.ctx.requestDecrypt,
                requestEncrypt: this.ctx.requestEncrypt!,
                appOrigin: this.ctx.appOrigin
            });
        }
        return this.keyCache!;
    }
    private resolveSpaceId(spaceId: string): string {
        if (spaceId === 'current') {
            return this.ctx.currentSpace?.id || 'default';
        }
        return spaceId;
    }

    async listSpaces(): Promise<Space[]> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        await this.syncInvites();

        const keys = await this.getKeys();
        const spaces: Space[] = [];
        const appPrefix = `${this.ctx.appOrigin}:`;

        for (const [scopedId, keyInfo] of keys.entries()) {
            if (keyInfo.deleted) continue;

            if (scopedId.startsWith(appPrefix)) {
                const id = scopedId.slice(appPrefix.length);
                spaces.push({
                    id,
                    name: keyInfo.name || `Space ${id.slice(0, 8)}`,
                    createdAt: keyInfo.createdAt || 0,
                    memberCount: 0,
                    appOrigin: this.ctx.appOrigin
                });
            }
        }
        return spaces;
    }

    async listAllSpaces(): Promise<Space[]> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const keys = await this.getKeys();
        const spaces: Space[] = [];

        for (const [scopedId, keyInfo] of keys.entries()) {
            if (keyInfo.deleted) continue;

            const colonIndex = scopedId.lastIndexOf(":");
            if (colonIndex === -1) continue;

            const appOrigin = scopedId.slice(0, colonIndex);
            const id = scopedId.slice(colonIndex + 1);

            spaces.push({
                id,
                name: keyInfo.name || `Space ${id.slice(0, 8)}`,
                createdAt: keyInfo.createdAt || 0,
                memberCount: 0,
                appOrigin,
            });
        }
        return spaces;
    }

    async createSpace(name: string, forAppOrigin?: string): Promise<Space> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const appOrigin = forAppOrigin || this.ctx.appOrigin;
        if (appOrigin === 'unknown') {
            throw new Error("Cannot create space for unknown app origin");
        }

        const spaceId = generateRandomId();
        const key = generateSymmetricKey();
        const scopedId = `${appOrigin}:${spaceId}`;
        const createdAt = Math.floor(Date.now() / 1000);

        const keys = await this.getKeys();
        keys.set(scopedId, {
            key,
            version: 1,
            name,
            createdAt,
            deleted: false
        });

        await this.saveKeys(keys);

        return {
            id: spaceId,
            name,
            createdAt,
            memberCount: 1,
            appOrigin: appOrigin
        };
    }
    async deleteSpace(rawSpaceId: string): Promise<string> {

        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const spaceId = this.resolveSpaceId(rawSpaceId);


        const keys = await this.getKeys();


        let targetScopedId = `${this.ctx.appOrigin}:${spaceId}`;


        if (!keys.has(targetScopedId)) {

            const found = Array.from(keys.keys()).find(k => k.endsWith(`:${spaceId}`));
            if (found) {

                targetScopedId = found;
            } else {

                throw new Error("Space not found");
            }
        }

        const existing = keys.get(targetScopedId)!;
        keys.set(targetScopedId, {
            ...existing,
            deleted: true,
            deletedAt: Math.floor(Date.now() / 1000)
        });

        await this.saveKeys(keys);

        return spaceId;
    }

    async updateSpace(rawSpaceId: string, name: string): Promise<{ id: string; name: string }> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const spaceId = this.resolveSpaceId(rawSpaceId);
        const keys = await this.getKeys();

        let targetScopedId = `${this.ctx.appOrigin}:${spaceId}`;

        if (!keys.has(targetScopedId)) {
            const found = Array.from(keys.keys()).find(k => k.endsWith(`:${spaceId}`));
            if (found) targetScopedId = found;
            else throw new Error("Space not found");
        }

        const existing = keys.get(targetScopedId)!;
        keys.set(targetScopedId, {
            ...existing,
            name,
        });

        await this.saveKeys(keys);
        return { id: spaceId, name };
    }

    async getMessages(rawSpaceId: string, limit = 50, since?: number): Promise<SpaceMessage[]> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const spaceId = this.resolveSpaceId(rawSpaceId);
        const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
        const keys = await this.getKeys();
        const keyInfo = keys.get(scopedId);

        if (!keyInfo) throw new Error("Space key not found");

        const filter: Filter = {
            kinds: [42],
            "#e": [spaceId],
            limit
        };
        if (since) filter.since = since;

        const events = await this.ctx.pool.querySync(this.ctx.relays, filter);
        const messages: SpaceMessage[] = [];

        for (const ev of events) {
            try {
                const payload = JSON.parse(ev.content);
                const plaintext = decryptSymmetric(keyInfo.key, payload.ciphertext, payload.nonce);

                if (plaintext) {
                    messages.push({
                        id: ev.id,
                        spaceId,
                        author: ev.pubkey,
                        content: plaintext,
                        type: 'message',
                        createdAt: ev.created_at
                    });
                }
            } catch (e) {
                // Skip decryption failures
            }
        }
        return messages;
    }

    async sendMessage(rawSpaceId: string, content: string): Promise<SpaceMessage> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const spaceId = this.resolveSpaceId(rawSpaceId);
        const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
        const keys = await this.getKeys();
        const keyInfo = keys.get(scopedId);

        if (!keyInfo) throw new Error("Space key not found");

        const encrypted = encryptSymmetric(keyInfo.key, content);
        const eventContent = JSON.stringify(encrypted);

        const unsigned: UnsignedNostrEvent = {
            kind: 42,
            created_at: Math.floor(Date.now() / 1000),
            tags: [['e', spaceId, '', 'root']],
            content: eventContent,
            pubkey: this.ctx.currentPubkey
        };

        const signed = await this.ctx.requestSign(unsigned);
        await Promise.any(this.ctx.pool.publish(this.ctx.relays, signed));

        return {
            id: signed.id,
            spaceId,
            author: signed.pubkey,
            content,
            type: 'message',
            createdAt: signed.created_at
        };
    }

    private async saveKeys(keys: Map<string, SpaceKey>) {
        // Reuse existing saveSpaceKeys utility
        await saveSpaceKeys({
            pool: this.ctx.pool,
            relays: this.ctx.relays,
            currentPubkey: this.ctx.currentPubkey,
            requestSign: this.ctx.requestSign,
            requestDecrypt: this.ctx.requestDecrypt,
            // Use the requestEncrypt from context (required for NIP-04/44 wrapping of self-keys)
            requestEncrypt: this.ctx.requestEncrypt!,
            appOrigin: this.ctx.appOrigin
        }, keys);
    }

    async inviteMember(rawSpaceId: string, pubkey: string, name?: string): Promise<{ invited: string }> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const spaceId = this.resolveSpaceId(rawSpaceId);
        let receiverPubkey = pubkey;

        if (receiverPubkey.startsWith("npub")) {
            try {
                const decoded = nip19.decode(receiverPubkey);
                if (decoded.type === "npub") {
                    receiverPubkey = decoded.data;
                }
            } catch (e) {
                throw new Error("Invalid npub format");
            }
        }

        const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
        const keys = await this.getKeys();
        const keyInfo = keys.get(scopedId);

        if (!keyInfo) throw new Error("Space key not found");

        const invitePayload = {
            type: "mirage_invite",
            spaceId,
            scopedId,
            key: keyInfo.key,
            version: keyInfo.version,
            name: name || keyInfo.name || `Space ${spaceId.slice(0, 8)}`,
            origin: this.ctx.appOrigin,
        };

        const innerEvent: UnsignedNostrEvent = {
            kind: 13,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: JSON.stringify(invitePayload),
            pubkey: this.ctx.currentPubkey,
        };

        const signedInner = await this.ctx.requestSign(innerEvent);
        const wrapper = wrapEvent(signedInner, receiverPubkey);

        try {
            await Promise.any(this.ctx.pool.publish(this.ctx.relays, wrapper as any));
        } catch (e) {
            throw new Error("Failed to publish invite");
        }

        return { invited: receiverPubkey };
    }

    async syncInvites(): Promise<void> {
        if (!this.ctx.currentPubkey) return;

        const filter: Filter = {
            kinds: [1059],
            "#p": [this.ctx.currentPubkey],
            limit: 100,
            since: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60,
        };

        const events = await this.ctx.pool.querySync(this.ctx.relays, filter);

        const keys = await this.getKeys();
        let updated = false;
        const newSpaces: { id: string; name?: string }[] = [];

        for (const wrap of events) {
            try {
                const innerJson = await this.ctx.requestDecrypt(wrap.pubkey, wrap.content);
                const innerEvent = JSON.parse(innerJson) as UnsignedNostrEvent;

                if (innerEvent.kind === 13) {
                    const payload = JSON.parse(innerEvent.content);

                    if (payload.type === "mirage_invite" && payload.key && payload.scopedId) {
                        const existing = keys.get(payload.scopedId);
                        let isNewerInvite = false;
                        const inviteTime = innerEvent.created_at;

                        if (existing) {
                            if (existing.latestInviteTimestamp) {
                                isNewerInvite = inviteTime > existing.latestInviteTimestamp;
                            } else {
                                isNewerInvite = inviteTime > (existing.deletedAt || existing.createdAt || 0);
                            }
                        }

                        if (!existing || (!existing.deleted && existing.version < payload.version) || isNewerInvite) {
                            keys.set(payload.scopedId, {
                                key: payload.key,
                                version: payload.version,
                                name: payload.name,
                                deleted: false,
                                deletedAt: undefined,
                                latestInviteTimestamp: inviteTime,
                            });
                            updated = true;

                            const parts = payload.scopedId.split(":");
                            if (parts.length > 1) {
                                newSpaces.push({ id: parts[1], name: payload.name });
                            }
                        }
                    }
                }
            } catch (e) {
                continue;
            }
        }

        if (updated) {
            await this.saveKeys(keys);

            // Notify engine about new spaces
            for (const space of newSpaces) {
                self.postMessage({
                    type: "NEW_SPACE_INVITE",
                    id: crypto.randomUUID(),
                    spaceId: space.id,
                    spaceName: space.name,
                });
            }
        }
    }

    async getSpaceStore(rawSpaceId: string): Promise<Record<string, unknown>> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const spaceId = this.resolveSpaceId(rawSpaceId);
        const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
        const keys = await this.getKeys();
        const keyInfo = keys.get(scopedId);

        if (!keyInfo) throw new Error("Space key not found");

        let cache = this.storeCache.get(scopedId);
        if (!cache) {
            cache = { state: new Map(), latestTimestamp: 0 };
            this.storeCache.set(scopedId, cache);
        }

        const filter: Filter = {
            kinds: [42],
            "#e": [spaceId],
            "#t": ["mirage_store"],
            since: cache.latestTimestamp + 1,
        };

        const events = await this.ctx.pool.querySync(this.ctx.relays, filter);

        for (const ev of events) {
            if (ev.created_at > cache.latestTimestamp) {
                cache.latestTimestamp = ev.created_at;
            }

            try {
                const payload = JSON.parse(ev.content);
                const plaintext = decryptSymmetric(keyInfo.key, payload.ciphertext, payload.nonce);

                if (!plaintext) continue;

                const data = JSON.parse(plaintext);
                if (Array.isArray(data) && data[0] === "store_put" && data.length === 3) {
                    const [_, key, value] = data;
                    const existing = cache.state.get(key);
                    if (!existing || ev.created_at >= existing.updatedAt) {
                        cache.state.set(key, { value, updatedAt: ev.created_at });
                    }
                }
            } catch (e) {
                // Ignore malformed
            }
        }

        const stateObj: Record<string, unknown> = {};
        for (const [key, record] of cache.state.entries()) {
            stateObj[key] = record.value;
        }

        return stateObj;
    }

    async updateSpaceStore(rawSpaceId: string, key: string, value: unknown): Promise<{ key: string; value: unknown; updatedAt: number }> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const spaceId = this.resolveSpaceId(rawSpaceId);
        const scopedId = `${this.ctx.appOrigin}:${spaceId}`;
        const keys = await this.getKeys();
        const keyInfo = keys.get(scopedId);

        if (!keyInfo) throw new Error("Space key not found");

        const rawPayload = JSON.stringify(["store_put", key, value]);
        const encrypted = encryptSymmetric(keyInfo.key, rawPayload);
        const content = JSON.stringify(encrypted);

        const unsigned: UnsignedNostrEvent = {
            kind: 42,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ["e", spaceId, "", "root"],
                ["t", "mirage_store"],
                ["k", key],
            ],
            content,
            pubkey: this.ctx.currentPubkey,
        };

        const signed = await this.ctx.requestSign(unsigned);
        await Promise.any(this.ctx.pool.publish(this.ctx.relays, signed));

        let cache = this.storeCache.get(scopedId);
        if (!cache) {
            cache = { state: new Map(), latestTimestamp: 0 };
            this.storeCache.set(scopedId, cache);
        }

        cache.state.set(key, { value, updatedAt: signed.created_at });
        if (signed.created_at > cache.latestTimestamp) {
            cache.latestTimestamp = signed.created_at;
        }

        return { key, value, updatedAt: signed.created_at };
    }
}
