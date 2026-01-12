import { SimplePool, nip19, type Filter, type Event } from 'nostr-tools';
import { AppDefinition, UnsignedNostrEvent } from '../../types';
import { SYSTEM_APP_ORIGIN } from '../keys';

// Copied/Adapted context since StorageRouteContext is gone
export interface AppServiceContext {
    pool: SimplePool;
    relays: string[];
    requestSign: (event: UnsignedNostrEvent) => Promise<Event>;
    requestEncrypt: (pubkey: string, plaintext: string) => Promise<string>;
    requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>;
    currentPubkey: string | null;
    appOrigin: string;
    currentSpace?: { id: string; name: string };
}

export class AppService {
    private ctx: AppServiceContext;

    constructor(
        pool: SimplePool,
        relays: string[],
        requestSign: (event: UnsignedNostrEvent) => Promise<any>,
        requestEncrypt: (pubkey: string, plaintext: string) => Promise<string>,
        requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>,
        currentPubkey: string | null,
        appOrigin: string
    ) {
        this.ctx = {
            pool,
            relays,
            requestSign,
            requestEncrypt,
            requestDecrypt,
            currentPubkey,
            appOrigin,
            currentSpace: undefined
        };
    }

    public updateContext(updates: Partial<AppServiceContext>) {
        this.ctx = { ...this.ctx, ...updates };
    }

    /**
     * Fetch an app's HTML code from Nostr relays using naddr.
     * Logic migrated from routes/apps.ts
     */
    public async fetchAppCode(naddr: string): Promise<{ html?: string; error?: string }> {
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

            const event = await this.ctx.pool.get(this.ctx.relays, filter);

            if (!event) {
                return { error: 'App not found on relays' };
            }

            // 3. Return content
            return { html: event.content };

        } catch (error) {
            console.error('[AppService] Fetch failed:', error);
            return { error: error instanceof Error ? error.message : 'Unknown fetch error' };
        }
    }

    /**
     * Load the user's app collection from NIP-78.
     * Logic migrated from library.ts
     */
    public async listApps(): Promise<AppDefinition[]> {
        const APP_LIST_ID = "app_list";
        console.log("[AppService] Loading app library...");

        try {
            const result = await this.internalGetStorage<AppDefinition[]>(APP_LIST_ID);

            let list = Array.isArray(result) ? result : null;
            console.log(
                "[AppService] Loaded apps from NIP-78:",
                list?.length ?? 0,
                "apps",
            );
            return list || [];
        } catch (error) {
            console.error("[AppService] Failed to load apps:", error);
            return [];
        }
    }

    /**
     * Add an app to the library.
     */
    public async addApp(app: AppDefinition): Promise<void> {
        console.log(
            "[AppService] Adding app to library:",
            app.name,
            app.naddr?.slice(0, 20) + "...",
        );
        const library = await this.listApps();

        let newIdentifier: string | undefined;
        let newPubkey: string | undefined;

        try {
            const decoded = nip19.decode(app.naddr);
            if (decoded.type === "naddr") {
                newIdentifier = decoded.data.identifier;
                newPubkey = decoded.data.pubkey;
            }
        } catch (e) {
            console.warn("[AppService] Failed to decode new app naddr:", e);
        }

        // Deduplicate
        const filtered = library.filter((existing) => {
            if (existing.naddr === app.naddr) return false; // Exact string match

            if (newIdentifier && newPubkey) {
                try {
                    const decoded = nip19.decode(existing.naddr);
                    if (decoded.type === "naddr") {
                        if (
                            decoded.data.identifier === newIdentifier &&
                            decoded.data.pubkey === newPubkey
                        ) {
                            return false;
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }
            return true;
        });

        const updated = [app, ...filtered];
        await this.saveAppLibrary(updated);
    }

    /**
     * Remove an app from the library.
     */
    public async removeApp(naddr: string): Promise<boolean> {
        console.log(
            "[AppService] Removing app from library:",
            naddr?.slice(0, 20) + "...",
        );
        const library = await this.listApps();

        const filtered = library.filter((a) => a.naddr !== naddr);

        if (filtered.length === library.length) {
            console.log("[AppService] App not found in library");
            return false;
        }

        await this.saveAppLibrary(filtered);

        // Publish deletion request (Kind 5)
        await this.publishDeletion(naddr);

        return true;
    }

    // Private Helpers

    private async saveAppLibrary(apps: AppDefinition[]): Promise<void> {
        const APP_LIST_ID = "app_list";
        console.log("[AppService] Saving app library...", apps.length, "apps");
        try {
            await this.internalPutStorage(APP_LIST_ID, apps);
            console.log("[AppService] Saved app list to NIP-78");
        } catch (error) {
            console.error("[AppService] Failed to save apps:", error);
            throw error;
        }
    }

    private async publishDeletion(naddr: string): Promise<void> {
        if (!this.ctx.currentPubkey) return;
        try {
            const decoded = nip19.decode(naddr);
            if (decoded.type === "naddr") {
                const { identifier } = decoded.data;
                console.log(`[AppService] Publishing deletion for d-tag="${identifier}"...`);

                const unsigned = {
                    kind: 5,
                    pubkey: this.ctx.currentPubkey,
                    created_at: Math.floor(Date.now() / 1000),
                    tags: [
                        ["a", `30078:${this.ctx.currentPubkey}:${identifier}`],
                    ],
                    content: "App deleted by user",
                };

                const signed = await this.ctx.requestSign(unsigned);

                await Promise.any(this.ctx.pool.publish(this.ctx.relays, signed));

                // Cleanup local
                if (!this.ctx.relays.includes("mirage://local")) {
                    try {
                        await Promise.any(this.ctx.pool.publish(["mirage://local"], signed));
                    } catch (e) {
                        console.warn("[AppService] Failed to clean up local storage:", e);
                    }
                }
            }
        } catch (e) {
            console.error("[AppService] Failed to publish deletion request:", e);
        }
    }

    // --- Internal Storage Parsing (Replacing storage.ts helpers) ---

    private async internalGetStorage<T>(key: string): Promise<T | null> {
        // System storage uses a specific context logic -> we assume library is SYSTEM_APP_ORIGIN related
        // or just user scope with 'mirage' origin? 
        // Previously apps.ts/library used SYSTEM_APP_ORIGIN.
        if (!this.ctx.currentPubkey) return null;

        const dTag = `${SYSTEM_APP_ORIGIN}:${key}`;

        const filter: Filter = {
            kinds: [30078],
            authors: [this.ctx.currentPubkey],
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
        if (event.pubkey === this.ctx.currentPubkey) {
            try {
                const plaintext = await this.ctx.requestDecrypt(this.ctx.currentPubkey, content);
                try {
                    return JSON.parse(plaintext);
                } catch {
                    return plaintext as any;
                }
            } catch { }
        }

        return content as any;
    }

    private async internalPutStorage(key: string, value: any, isPublic: boolean = false): Promise<Event> {
        if (!this.ctx.currentPubkey) throw new Error("Not authenticated");

        const dTag = `${SYSTEM_APP_ORIGIN}:${key}`;
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
}
