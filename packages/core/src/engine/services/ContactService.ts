import { SimplePool, type Filter, nip19 } from 'nostr-tools';
import { UnsignedNostrEvent } from '../../types';

export interface ContactServiceContext {
    pool: SimplePool;
    relays: string[];
    currentPubkey: string | null;
    requestSign: (event: UnsignedNostrEvent) => Promise<any>;
}

export interface Contact {
    pubkey: string;
    relay?: string;
    petname?: string;
}

export class ContactService {
    private ctx: ContactServiceContext;

    constructor(
        pool: SimplePool,
        relays: string[],
        requestSign: (event: UnsignedNostrEvent) => Promise<any>,
        currentPubkey: string | null
    ) {
        this.ctx = {
            pool,
            relays,
            requestSign,
            currentPubkey
        };
    }

    public updateContext(updates: Partial<ContactServiceContext>) {
        this.ctx = { ...this.ctx, ...updates };
    }

    /**
     * Get the current user's contact list
     */
    public async listContacts(): Promise<Contact[]> {
        if (!this.ctx.currentPubkey) {
            throw new Error('Not authenticated');
        }
        return this.fetchContactList(this.ctx.currentPubkey);
    }

    /**
     * Get another user's contact list
     */
    public async getUserContacts(targetPubkey: string): Promise<Contact[]> {
        const hexPubkey = this.normalizePubkey(targetPubkey);
        return this.fetchContactList(hexPubkey);
    }

    /**
     * Replace the current user's contact list
     */
    public async updateContacts(contacts: Contact[]): Promise<void> {
        if (!this.ctx.currentPubkey) {
            throw new Error('Not authenticated');
        }

        const tags = contacts.map(c => {
            const tag = ['p', this.normalizePubkey(c.pubkey)];
            if (c.relay) tag.push(c.relay);
            if (c.petname) {
                if (!c.relay) tag.push(''); // Fill empty relay if petname exists
                tag.push(c.petname);
            }
            return tag;
        });

        const event: UnsignedNostrEvent = {
            kind: 3,
            created_at: Math.floor(Date.now() / 1000),
            tags: tags,
            content: '', // Kind 3 content is usually empty
            pubkey: this.ctx.currentPubkey
        };

        const signed = await this.ctx.requestSign(event);

        await Promise.any(this.ctx.pool.publish(this.ctx.relays, signed));
    }

    // Helpers

    private async fetchContactList(pubkey: string): Promise<Contact[]> {
        const filter: Filter = {
            kinds: [3],
            authors: [pubkey],
            limit: 1
        };

        const event = await this.ctx.pool.get(this.ctx.relays, filter);

        if (!event) return [];

        return event.tags
            .filter(t => t[0] === 'p')
            .map(t => ({
                pubkey: t[1],
                relay: t[2] || undefined,
                petname: t[3] || undefined
            }));
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
