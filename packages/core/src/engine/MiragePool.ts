import { SimplePool } from 'nostr-tools';
import { AbstractRelay } from 'nostr-tools/abstract-relay';
import type { LocalRelay } from './LocalRelay';

export class MiragePool extends SimplePool {
    private localRelay: LocalRelay;

    constructor(localRelay: LocalRelay) {
        super();
        this.localRelay = localRelay;
    }

    public async ensureRelay(url: string): Promise<AbstractRelay> {
        if (url === 'mirage://local') {
            if (!this.localRelay.connected) {
                await this.localRelay.connect();
            }
            return this.localRelay;
        }
        return super.ensureRelay(url);
    }
}
