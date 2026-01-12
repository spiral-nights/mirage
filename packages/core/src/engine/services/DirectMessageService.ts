import { SimplePool, type Filter, nip19 } from 'nostr-tools';
import { UnsignedNostrEvent } from '../../types';
import { wrapEvent, unwrapEvent } from '../nip17';

export interface DirectMessageServiceContext {
    pool: SimplePool;
    relays: string[];
    currentPubkey: string | null;
    requestSign: (event: UnsignedNostrEvent) => Promise<any>;
    requestEncrypt: (pubkey: string, plaintext: string) => Promise<string>;
    requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>;
}

export interface DMConversation {
    pubkey: string;
    lastMessage: string;
    timestamp: number;
    unreadCount: number;
}

export interface DMMessage {
    id: string;
    pubkey: string; // The other person
    sender: string; // The actual sender's pubkey
    content: string;
    createdAt: number;
    isIncoming: boolean;
}

export class DirectMessageService {
    private ctx: DirectMessageServiceContext;

    constructor(
        pool: SimplePool,
        relays: string[],
        requestSign: (event: UnsignedNostrEvent) => Promise<any>,
        requestEncrypt: (pubkey: string, plaintext: string) => Promise<string>,
        requestDecrypt: (pubkey: string, ciphertext: string) => Promise<string>,
        currentPubkey: string | null
    ) {
        this.ctx = {
            pool,
            relays,
            requestSign,
            requestEncrypt,
            requestDecrypt,
            currentPubkey
        };
    }

    public updateContext(updates: Partial<DirectMessageServiceContext>) {
        this.ctx = { ...this.ctx, ...updates };
    }

    /**
     * List all conversations (unique people we've chatted with)
     */
    public async listDMs(): Promise<DMConversation[]> {
        if (!this.ctx.currentPubkey) throw new Error('Not authenticated');

        const filter: Filter = {
            kinds: [1059],
            '#p': [this.ctx.currentPubkey],
            limit: 100
        };

        const events = await this.ctx.pool.querySync(this.ctx.relays, filter);
        const conversations = new Map<string, DMConversation>();
        const seenIds = new Set<string>();

        for (const wrap of events) {
            try {
                const sealEvent = await unwrapEvent(wrap, this.ctx.requestDecrypt);
                if (!sealEvent || sealEvent.kind !== 13) continue;
                if (!sealEvent.pubkey) continue;

                const senderPubkey = sealEvent.pubkey as string;
                let rumorJson: string;
                try {
                    rumorJson = await this.ctx.requestDecrypt(senderPubkey, sealEvent.content);
                } catch (err) {
                    console.warn(`[DM] Failed to decrypt Seal from ${senderPubkey.slice(0, 8)}`);
                    continue;
                }

                const rumor = JSON.parse(rumorJson) as UnsignedNostrEvent;
                if (!rumor.pubkey) continue;

                const uniqueId = (rumor as any).id || `${rumor.pubkey}:${rumor.created_at}:${rumor.content.slice(0, 20)}`;
                if (seenIds.has(uniqueId)) continue;
                seenIds.add(uniqueId);

                const sender = rumor.pubkey;
                let otherPubkey = sender;

                if (sender === this.ctx.currentPubkey!) {
                    const pTag = rumor.tags.find(t => t[0] === 'p');
                    if (pTag && pTag[1]) {
                        otherPubkey = pTag[1];
                    }
                }

                const existing = conversations.get(otherPubkey);
                const ts = rumor.created_at;

                if (!existing || ts > existing.timestamp) {
                    conversations.set(otherPubkey, {
                        pubkey: otherPubkey,
                        lastMessage: rumor.content,
                        timestamp: ts,
                        unreadCount: 0
                    });
                }
            } catch (e) {
                continue;
            }
        }

        return Array.from(conversations.values()).sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get message history with a specific person
     */
    public async getMessages(targetPubkey: string, limit: number = 50): Promise<DMMessage[]> {
        if (!this.ctx.currentPubkey) throw new Error('Not authenticated');

        let hexTarget = this.normalizePubkey(targetPubkey);

        const filter: Filter = {
            kinds: [1059],
            '#p': [this.ctx.currentPubkey],
            limit
        };

        const events = await this.ctx.pool.querySync(this.ctx.relays, filter);
        const messages: DMMessage[] = [];
        const seenIds = new Set<string>();

        for (const wrap of events) {
            try {
                const sealEvent = await unwrapEvent(wrap, this.ctx.requestDecrypt);
                if (!sealEvent || sealEvent.kind !== 13) continue;
                if (!sealEvent.pubkey) continue;

                const senderPubkey = sealEvent.pubkey as string;
                let rumorJson: string;
                try {
                    rumorJson = await this.ctx.requestDecrypt(senderPubkey, sealEvent.content);
                } catch (decErr) {
                    continue;
                }

                const rumor = JSON.parse(rumorJson) as UnsignedNostrEvent;
                if (!rumor.pubkey) continue;

                const uniqueId = (rumor as any).id || `${rumor.pubkey}:${rumor.created_at}:${rumor.content}`;
                if (seenIds.has(uniqueId)) continue;
                seenIds.add(uniqueId);

                const sender = rumor.pubkey;
                let isMatch = false;
                let isIncoming = false;

                if (sender === hexTarget) {
                    isMatch = true;
                    isIncoming = true;
                } else if (sender === this.ctx.currentPubkey) {
                    const pTag = rumor.tags.find(t => t[0] === 'p');
                    if (pTag && pTag[1] === hexTarget) {
                        isMatch = true;
                        isIncoming = false;
                    }
                }

                if (isMatch) {
                    messages.push({
                        id: (rumor as any).id || 'unsigned',
                        pubkey: hexTarget,
                        sender: sender as string,
                        content: rumor.content,
                        createdAt: rumor.created_at,
                        isIncoming
                    });
                }
            } catch (e) { continue; }
        }

        return messages.sort((a, b) => a.createdAt - b.createdAt);
    }

    /**
     * Send a Direct Message
     */
    public async sendDM(targetPubkey: string, content: string): Promise<DMMessage> {
        if (!this.ctx.currentPubkey) throw new Error('Not authenticated');
        if (!content) throw new Error('Content required');

        let hexTarget = this.normalizePubkey(targetPubkey);

        const rumor: UnsignedNostrEvent = {
            kind: 14,
            created_at: Math.floor(Date.now() / 1000),
            tags: [['p', hexTarget]],
            content: content,
            pubkey: this.ctx.currentPubkey
        };
        const rumorJson = JSON.stringify(rumor);

        // Path A: Send to Recipient
        const cipherTextForRecipient = await this.ctx.requestEncrypt(hexTarget, rumorJson);
        const sealForRecipient: UnsignedNostrEvent = {
            kind: 13,
            created_at: Math.floor(Date.now() / 1000),
            tags: [],
            content: cipherTextForRecipient,
            pubkey: this.ctx.currentPubkey
        };
        const signedSealForRecipient = await this.ctx.requestSign(sealForRecipient);
        const giftForRecipient = wrapEvent(signedSealForRecipient, hexTarget);

        await Promise.any(this.ctx.pool.publish(this.ctx.relays, giftForRecipient));

        // Path B: Send to Self (History)
        if (hexTarget !== this.ctx.currentPubkey) {
            const cipherTextForSelf = await this.ctx.requestEncrypt(this.ctx.currentPubkey, rumorJson);
            const sealForSelf: UnsignedNostrEvent = {
                kind: 13,
                created_at: Math.floor(Date.now() / 1000),
                tags: [],
                content: cipherTextForSelf,
                pubkey: this.ctx.currentPubkey
            };
            const signedSealForSelf = await this.ctx.requestSign(sealForSelf);
            const giftForSelf = wrapEvent(signedSealForSelf, this.ctx.currentPubkey);

            await Promise.any(this.ctx.pool.publish(this.ctx.relays, giftForSelf));
        }

        return {
            id: 'sent',
            pubkey: hexTarget,
            sender: this.ctx.currentPubkey,
            content: content,
            createdAt: rumor.created_at,
            isIncoming: false
        };
    }

    private normalizePubkey(pubkey: string): string {
        if (pubkey.startsWith('npub')) {
            try {
                const d = nip19.decode(pubkey);
                if (d.type === 'npub') return d.data as string;
            } catch { }
        }
        return pubkey;
    }
}
