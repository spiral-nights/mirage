import { SimplePool, type Filter } from 'nostr-tools';
import { UserProfile } from '../../types';

export interface UserServiceContext {
    pool: SimplePool;
    relays: string[];
    currentPubkey: string | null;
}

export class UserService {
    private ctx: UserServiceContext;

    constructor(
        pool: SimplePool,
        relays: string[],
        currentPubkey: string | null
    ) {
        this.ctx = {
            pool,
            relays,
            currentPubkey
        };
    }

    public updateContext(updates: Partial<UserServiceContext>) {
        this.ctx = { ...this.ctx, ...updates };
    }

    /**
     * Get current user's profile
     */
    public async getCurrentUser(): Promise<UserProfile> {
        if (!this.ctx.currentPubkey) {
            throw new Error("Not authenticated");
        }
        return this.getUserByPubkey(this.ctx.currentPubkey);
    }

    /**
     * Get user profile by pubkey
     */
    public async getUserByPubkey(pubkey: string): Promise<UserProfile> {
        const filter: Filter = {
            kinds: [0],
            authors: [pubkey],
            limit: 1,
        };

        const event = await this.ctx.pool.get(this.ctx.relays, filter);

        if (!event) {
            throw new Error("User not found");
        }

        try {
            const metadata = JSON.parse(event.content);
            return {
                pubkey: event.pubkey,
                name: metadata.name,
                displayName: metadata.display_name || metadata.displayName,
                about: metadata.about,
                picture: metadata.picture,
                nip05: metadata.nip05,
                lud16: metadata.lud16,
            };
        } catch {
            throw new Error("Invalid metadata format");
        }
    }
}
