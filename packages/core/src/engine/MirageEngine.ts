import { SimplePool, nip19 } from 'nostr-tools';
import { SYSTEM_APP_ORIGIN, KeyManager } from './keys';
import { SpaceService } from './services/SpaceService';
import { AppService } from './services/AppService';
import { ContactService } from './services/ContactService';
import { DirectMessageService } from './services/DirectMessageService';
import { EventService } from './services/EventService';
import { StorageService } from './services/StorageService';
import { UserService } from './services/UserService';
import type {
    MirageMessage,
    ApiRequestMessage,
    ApiResponseMessage,
    RelayConfigMessage,
    FetchAppRequestMessage,
    FetchAppResultMessage
} from '../types';
import { requestSign, requestDecrypt, requestEncrypt } from './signing';

import { getLocalRelay, type LocalRelay } from './LocalRelay';

export interface MirageEngineConfig {
    relays: string[];
    pool?: SimplePool;
}

export class MirageEngine {
    private pool: SimplePool;
    private relays: string[];
    private localRelay: LocalRelay;
    private spaceService: SpaceService;
    private appService: AppService;
    private contactService: ContactService;
    private directMessageService: DirectMessageService;
    private eventService: EventService;
    private storageService: StorageService;
    private userService: UserService;

    // Keys and Session
    private keys: KeyManager;
    private sessionKey: Uint8Array | null = null;

    // State
    private currentPubkey: string | null = null;
    private appOrigin: string = 'mirage'; // Default to SYSTEM_APP_ORIGIN
    // Add currentSpace state
    private currentSpace: { id: string; name: string } | undefined;

    constructor(config: MirageEngineConfig) {
        this.pool = config.pool || new SimplePool();
        this.relays = config.relays;
        this.localRelay = getLocalRelay();

        // Initialize services
        this.keys = new KeyManager(this.pool);

        this.spaceService = new SpaceService({
            pool: this.pool,
            relays: this.relays,
            localRelay: this.localRelay,
            currentPubkey: this.currentPubkey,
            appOrigin: this.appOrigin,
            currentSpace: this.currentSpace,
            requestSign: requestSign,
            requestDecrypt: requestDecrypt,
            requestEncrypt: requestEncrypt
        });

        this.appService = new AppService(
            this.pool,
            this.relays,
            requestSign,
            requestEncrypt,
            requestDecrypt,
            this.currentPubkey,
            this.appOrigin
        );

        this.contactService = new ContactService(
            this.pool,
            this.relays,
            requestSign,
            this.currentPubkey
        );

        this.directMessageService = new DirectMessageService(
            this.pool,
            this.relays,
            requestSign,
            requestEncrypt,
            requestDecrypt,
            this.currentPubkey
        );

        this.eventService = new EventService(
            this.pool,
            this.relays,
            requestSign
        );

        this.storageService = new StorageService(
            this.pool,
            this.relays,
            requestSign,
            requestEncrypt,
            requestDecrypt,
            this.currentPubkey,
            this.currentSpace
        );

        this.userService = new UserService(
            this.pool,
            this.relays,
            this.currentPubkey
        );
    }

    public async handleMessage(message: MirageMessage): Promise<void> {
        switch (message.type) {
            case 'API_REQUEST':
                await this.handleApiRequest(message);
                break;
            case 'ACTION_FETCH_APP':
                await this.handleFetchApp(message as FetchAppRequestMessage);
                break;
            case 'SET_PUBKEY':
                this.currentPubkey = message.pubkey;
                this.updateContext();
                break;
            case 'SET_APP_ORIGIN':
                this.appOrigin = message.origin;
                this.updateContext();
                break;
            case 'RELAY_CONFIG':
                // Cast to specific type to avoid lint errors
                const relayMsg = message as RelayConfigMessage;
                if (relayMsg.action === 'SET') {
                    this.relays = relayMsg.relays;
                    this.updateContext();
                }
                break;
            case 'SET_SPACE_CONTEXT':
                // Manually cast since type union might be incomplete or distinct
                const ctxMsg = message as any;
                this.currentSpace = { id: ctxMsg.spaceId, name: ctxMsg.spaceName };
                this.updateContext();
                break;
        }
    }

    private async handleApiRequest(message: ApiRequestMessage) {
        const { method, path, body, id, origin: requestOrigin } = message;

        // Fallback to legacy stateful origin if not stamped (should be rare after host update)
        // or to SYSTEM_APP_ORIGIN for admin safety.
        const origin = requestOrigin || this.appOrigin || SYSTEM_APP_ORIGIN;

        let response: ApiResponseMessage;

        try {
            // Router Logic (Simplified for V2)
            if (path.startsWith('/mirage/v1/space/me/')) {
                // Personal Storage (StorageService)
                response = await this.routeStorage(method, path, body, id, origin);
            } else if (path.startsWith('/mirage/v1/space') || path.startsWith('/mirage/v1/admin/spaces')) {
                response = await this.routeSpaces(method, path, body, id, origin);
            } else if (path.startsWith('/mirage/v1/admin/apps')) {
                response = await this.routeApps(method, path, body, id, origin);
            } else if (path.startsWith('/mirage/v1/contacts')) {
                response = await this.routeContacts(method, path, body, id, origin);
            } else if (path.startsWith('/mirage/v1/dms')) {
                response = await this.routeDMs(method, path, body, id, origin);
            } else if (path.startsWith('/mirage/v1/events')) {
                response = await this.routeEvents(method, path, body, id, origin);
            } else if (path.startsWith('/mirage/v1/user') || path.startsWith('/mirage/v1/users')) {
                response = await this.routeUsers(method, path, body, id, origin);
            } else {
                response = { type: 'API_RESPONSE', id, status: 404, body: { error: 'Not found' } };
            }
        } catch (e: any) {
            response = { type: 'API_RESPONSE', id, status: 500, body: { error: e.message } };
        }

        this.send(response);
    }

    private async handleFetchApp(message: FetchAppRequestMessage): Promise<void> {
        const { naddr, id } = message;
        const result = await this.appService.fetchAppCode(naddr);

        const response: FetchAppResultMessage = {
            type: 'FETCH_APP_RESULT',
            id,
            html: result.html,
            error: result.error
        };
        this.send(response as any); // Types might be strictly MirageMessage, but postMessage accepts generic
    }

    private async routeApps(method: string, path: string, body: any, id: string, origin: string): Promise<ApiResponseMessage> {
        const isAdminOrigin = origin === SYSTEM_APP_ORIGIN;
        if (!isAdminOrigin) {
            return { type: 'API_RESPONSE', id, status: 403, body: { error: 'Admin access required' } };
        }

        // GET /mirage/v1/admin/apps
        if (method === 'GET' && path === '/mirage/v1/admin/apps') {
            const apps = await this.appService.listApps();
            return { type: 'API_RESPONSE', id, status: 200, body: apps };
        }

        // POST /mirage/v1/admin/apps/publish
        // Dedicated endpoint for publishing app HTML (Kind 30078) + adding to library.
        if (method === 'POST' && path === '/mirage/v1/admin/apps/publish') {
            const { html, name, existingDTag } = body as { html: string; name?: string; existingDTag?: string };

            if (!this.currentPubkey) {
                return { type: 'API_RESPONSE', id, status: 401, body: { error: 'Not authenticated' } };
            }

            if (!html || typeof html !== 'string') {
                return { type: 'API_RESPONSE', id, status: 400, body: { error: 'html required' } };
            }

            const appName = typeof name === 'string' && name.trim() ? name.trim() : 'Untitled App';
            const dTag = existingDTag || `mirage:app:${crypto.randomUUID()}`;

            const tags = [
                ['d', dTag],
                ['name', appName],
                ['t', 'mirage_app'],
            ];

            await this.eventService.publishEvent({
                kind: 30078,
                content: html,
                tags,
            });

            const naddr = nip19.naddrEncode({
                kind: 30078,
                pubkey: this.currentPubkey,
                identifier: dTag,
                relays: this.relays,
            });

            const appDef = { naddr, name: appName, createdAt: Date.now() };
            await this.appService.addApp(appDef as any);

            return { type: 'API_RESPONSE', id, status: 201, body: appDef };
        }

        // POST /mirage/v1/admin/apps
        if (method === 'POST' && path === '/mirage/v1/admin/apps') {
            await this.appService.addApp(body as any);
            return { type: 'API_RESPONSE', id, status: 201, body: { success: true } };
        }

        // DELETE /mirage/v1/admin/apps (body needs naddr)
        if (method === 'DELETE' && path === '/mirage/v1/admin/apps') {
            const { naddr } = body as { naddr: string };
            if (!naddr) return { type: 'API_RESPONSE', id, status: 400, body: { error: 'naddr required' } };

            const deleted = await this.appService.removeApp(naddr);
            if (deleted) {
                return { type: 'API_RESPONSE', id, status: 200, body: { deleted: naddr } };
            } else {
                return { type: 'API_RESPONSE', id, status: 404, body: { error: 'App not found' } };
            }
        }

        return { type: 'API_RESPONSE', id, status: 404, body: { error: 'Route not found' } };
    }

    private async routeContacts(method: string, path: string, body: any, id: string, _origin: string): Promise<ApiResponseMessage> {
        // GET /mirage/v1/contacts
        if (method === 'GET' && path === '/mirage/v1/contacts') {
            const contacts = await this.contactService.listContacts();
            return { type: 'API_RESPONSE', id, status: 200, body: contacts };
        }

        // PUT /mirage/v1/contacts
        if (method === 'PUT' && path === '/mirage/v1/contacts') {
            await this.contactService.updateContacts(body.contacts);
            return { type: 'API_RESPONSE', id, status: 200, body: { success: true } };
        }

        // GET /mirage/v1/contacts/:pubkey
        const match = this.matchRoute('/mirage/v1/contacts/:pubkey', path);
        if (match && method === 'GET') {
            const contacts = await this.contactService.getUserContacts(match.params.pubkey);
            return { type: 'API_RESPONSE', id, status: 200, body: contacts };
        }

        return { type: 'API_RESPONSE', id, status: 404, body: { error: 'Route not found' } };
    }

    private async routeDMs(method: string, path: string, body: any, id: string, _origin: string): Promise<ApiResponseMessage> {
        // GET /mirage/v1/dms
        if (method === 'GET' && path === '/mirage/v1/dms') {
            const dms = await this.directMessageService.listDMs();
            return { type: 'API_RESPONSE', id, status: 200, body: dms };
        }

        // GET /mirage/v1/dms/:pubkey
        let match = this.matchRoute('/mirage/v1/dms/:pubkey', path);
        if (match && method === 'GET') {
            const messages = await this.directMessageService.getMessages(match.params.pubkey, body?.limit);
            return { type: 'API_RESPONSE', id, status: 200, body: messages };
        }

        // POST /mirage/v1/dms/:pubkey
        match = this.matchRoute('/mirage/v1/dms/:pubkey', path);
        if (match && method === 'POST') {
            const result = await this.directMessageService.sendDM(match.params.pubkey, body.content);
            return { type: 'API_RESPONSE', id, status: 201, body: result };
        }

        return { type: 'API_RESPONSE', id, status: 404, body: { error: 'Route not found' } };
    }

    private async routeEvents(method: string, path: string, body: any, id: string, _origin: string): Promise<ApiResponseMessage> {
        // POST /mirage/v1/events
        if (method === 'POST' && path === '/mirage/v1/events') {
            const result = await this.eventService.publishEvent(body, body.targetRelays);
            return { type: 'API_RESPONSE', id, status: 201, body: result };
        }

        // GET /mirage/v1/events
        if (method === 'GET' && path === '/mirage/v1/events') {
            const [urlPath, queryString] = path.split('?');
            if (urlPath !== '/mirage/v1/events') return { type: 'API_RESPONSE', id, status: 404, body: { error: 'Route not found' } };

            const params: any = {};
            if (queryString) {
                const searchParams = new URLSearchParams(queryString);
                searchParams.forEach((value, key) => {
                    if (key === 'kinds' || key === 'authors') {
                        params[key] = value.split(',').map(v => v.trim());
                        if (key === 'kinds') params[key] = params[key].map((k: string) => parseInt(k));
                    } else if (key === 'limit' || key === 'since' || key === 'until') {
                        params[key] = parseInt(value);
                    } else if (key === 'tags') {
                        const tagsRaw = value.split(',');
                        tagsRaw.forEach((tagStr: string) => {
                            const [tKey, tValue] = tagStr.split(':');
                            if (tKey && tValue) {
                                const tagName = `#${tKey}`;
                                if (!params[tagName]) params[tagName] = [];
                                params[tagName].push(tValue);
                            }
                        });
                    }
                });
            }

            const filter: any = {};
            if (params.kinds) filter.kinds = params.kinds;
            if (params.authors) filter.authors = params.authors;
            if (params.limit) filter.limit = params.limit;
            if (params.since) filter.since = params.since;
            if (params.until) filter.until = params.until;
            Object.keys(params).forEach(k => {
                if (k.startsWith('#')) filter[k] = params[k];
            });
            if (!filter.limit) filter.limit = 20;

            const events = await this.eventService.getEvents(filter);
            return { type: 'API_RESPONSE', id, status: 200, body: events };
        }

        return { type: 'API_RESPONSE', id, status: 404, body: { error: 'Route not found' } };
    }

    private async routeUsers(method: string, path: string, _body: any, id: string, _origin: string): Promise<ApiResponseMessage> {
        // GET /mirage/v1/user/me
        if (method === 'GET' && path === '/mirage/v1/user/me') {
            try {
                const user = await this.userService.getCurrentUser();
                return { type: 'API_RESPONSE', id, status: 200, body: user };
            } catch (e: any) {
                if (e.message === 'Not authenticated') return { type: 'API_RESPONSE', id, status: 401, body: { error: 'Not authenticated' } };
                throw e;
            }
        }

        // GET /mirage/v1/users/:pubkey
        const match = this.matchRoute('/mirage/v1/users/:pubkey', path);
        if (match && method === 'GET') {
            const user = await this.userService.getUserByPubkey(match.params.pubkey);
            return { type: 'API_RESPONSE', id, status: 200, body: user };
        }

        return { type: 'API_RESPONSE', id, status: 404, body: { error: 'Route not found' } };
    }

    private async routeStorage(method: string, path: string, body: any, id: string, origin: string): Promise<ApiResponseMessage> {
        // Match /mirage/v1/space/me/:key
        const match = this.matchRoute('/mirage/v1/space/me/:key', path);
        if (match) {
            // Parse query params for public flag or pubkey
            const [_urlPath, queryString] = path.split('?');
            const params: any = {};
            if (queryString) {
                const searchParams = new URLSearchParams(queryString);
                searchParams.forEach((value, key) => params[key] = value);
            }

            if (method === 'GET') {
                const val = await this.storageService.getStorage(match.params.key, origin, params.pubkey);
                // Return NIP-78 format: { key, value, updatedAt }
                if (val === null) return { type: 'API_RESPONSE', id, status: 404, body: { error: 'Key not found' } };
                return {
                    type: 'API_RESPONSE',
                    id,
                    status: 200,
                    body: {
                        key: match.params.key,
                        value: val,
                        updatedAt: Math.floor(Date.now() / 1000)
                    }
                };
            }

            if (method === 'PUT') {
                const isPublic = params.public === 'true';
                const event = await this.storageService.putStorage(match.params.key, body, origin, isPublic);
                return {
                    type: 'API_RESPONSE',
                    id,
                    status: 200,
                    body: {
                        key: match.params.key,
                        value: body,
                        updatedAt: event.created_at,
                        public: isPublic
                    }
                };
            }

            if (method === 'DELETE') {
                await this.storageService.deleteStorage(match.params.key, origin);
                return { type: 'API_RESPONSE', id, status: 200, body: { deleted: true, key: match.params.key } };
            }
        }
        return { type: 'API_RESPONSE', id, status: 404, body: { error: 'Route not found' } };
    }


    private async routeSpaces(method: string, path: string, body: any, id: string, origin: string): Promise<ApiResponseMessage> {
        // GET /mirage/v1/spaces
        if (method === 'GET' && path === '/mirage/v1/spaces') {
            const spaces = await this.spaceService.listSpaces(origin);
            return { type: 'API_RESPONSE', id, status: 200, body: spaces };
        }

        // GET /mirage/v1/admin/spaces
        if (method === 'GET' && path === '/mirage/v1/admin/spaces') {
            const spaces = await this.spaceService.listAllSpaces();
            return { type: 'API_RESPONSE', id, status: 200, body: spaces };
        }

        // POST /mirage/v1/admin/spaces
        if (method === 'POST' && path === '/mirage/v1/admin/spaces') {
            const space = await this.spaceService.createSpace(body.name, body.appOrigin);
            return { type: 'API_RESPONSE', id, status: 201, body: space };
        }

        // Match /mirage/v1/spaces/:id
        let match = this.matchRoute('/mirage/v1/spaces/:id', path);
        if (match) {
            if (method === 'DELETE') {
                const deleted = await this.spaceService.deleteSpace(match.params.id, origin);
                return { type: 'API_RESPONSE', id, status: 200, body: { deleted } };
            }
        }

        // Match /mirage/v1/admin/spaces/:id
        match = this.matchRoute('/mirage/v1/admin/spaces/:id', path);
        if (match) {
            if (method === 'PUT') {
                const updated = await this.spaceService.updateSpace(match.params.id, body.name, origin);
                return { type: 'API_RESPONSE', id, status: 200, body: updated };
            }
            if (method === 'DELETE') {
                const deleted = await this.spaceService.deleteSpace(match.params.id, origin);
                return { type: 'API_RESPONSE', id, status: 200, body: { deleted } };
            }
        }

        // Match /mirage/v1/spaces/:id/messages
        match = this.matchRoute('/mirage/v1/spaces/:id/messages', path);
        if (match) {
            if (method === 'GET') {
                const messages = await this.spaceService.getMessages(match.params.id, body?.limit, body?.since, origin);
                return { type: 'API_RESPONSE', id, status: 200, body: messages };
            }
            if (method === 'POST') {
                const msg = await this.spaceService.sendMessage(match.params.id, body.content, origin);
                return { type: 'API_RESPONSE', id, status: 201, body: msg };
            }
        }

        // Match /mirage/v1/admin/spaces/:id/invitations
        match = this.matchRoute('/mirage/v1/admin/spaces/:id/invitations', path);
        if (match && method === 'POST') {
            const result = await this.spaceService.inviteMember(match.params.id, body.pubkey, body.name, origin);
            return { type: 'API_RESPONSE', id, status: 200, body: result };
        }

        // Match /mirage/v1/spaces/:id/store
        match = this.matchRoute('/mirage/v1/spaces/:id/store', path);
        if (match && method === 'GET') {
            const store = await this.spaceService.getSpaceStore(match.params.id, origin);
            return { type: 'API_RESPONSE', id, status: 200, body: store };
        }

        // Match /mirage/v1/spaces/:id/store/:key
        match = this.matchRoute('/mirage/v1/spaces/:id/store/:key', path);
        if (match && method === 'PUT') {
            const result = await this.spaceService.updateSpaceStore(match.params.id, match.params.key, body, origin);
            return { type: 'API_RESPONSE', id, status: 200, body: result };
        }

        // --- Implicit Routes (Current Space) ---

        // GET /mirage/v1/space (Context)
        if (method === 'GET' && path === '/mirage/v1/space') {
            return {
                type: 'API_RESPONSE', id, status: 200, body: {
                    spaceId: this.currentSpace?.id || '',
                    spaceName: this.currentSpace?.name || ''
                }
            };
        }

        // PUT /mirage/v1/space (Context)
        if (method === 'PUT' && path === '/mirage/v1/space') {
            const { spaceId, spaceName } = body as { spaceId: string, spaceName?: string };
            this.currentSpace = { id: spaceId, name: spaceName || '' };
            this.updateContext();
            return { type: 'API_RESPONSE', id, status: 200, body: { spaceId, spaceName: spaceName || '' } };
        }

        // GET /mirage/v1/space/store
        if (method === 'GET' && path === '/mirage/v1/space/store') {
            if (!this.currentSpace?.id) return { type: 'API_RESPONSE', id, status: 400, body: { error: 'No space context set' } };
            const store = await this.spaceService.getSpaceStore(this.currentSpace.id, origin);
            return { type: 'API_RESPONSE', id, status: 200, body: store };
        }

        // PUT /mirage/v1/space/store/:key
        match = this.matchRoute('/mirage/v1/space/store/:key', path);
        if (match && method === 'PUT') {
            if (!this.currentSpace?.id) return { type: 'API_RESPONSE', id, status: 400, body: { error: 'No space context set' } };
            const result = await this.spaceService.updateSpaceStore(this.currentSpace.id, match.params.key, body, origin);
            return { type: 'API_RESPONSE', id, status: 200, body: result };
        }

        // GET/POST /mirage/v1/space/messages
        if (path === '/mirage/v1/space/messages') {
            if (!this.currentSpace?.id) return { type: 'API_RESPONSE', id, status: 400, body: { error: 'No space context set' } };

            if (method === 'GET') {
                const messages = await this.spaceService.getMessages(this.currentSpace.id, body?.limit, body?.since, origin);
                return { type: 'API_RESPONSE', id, status: 200, body: messages };
            }
            if (method === 'POST') {
                const msg = await this.spaceService.sendMessage(this.currentSpace.id, body.content, origin);
                return { type: 'API_RESPONSE', id, status: 201, body: msg };
            }
        }

        // POST /mirage/v1/space/invitations (Implicit context invite)
        if (method === 'POST' && path === '/mirage/v1/space/invitations') {
            if (!this.currentSpace?.id) return { type: 'API_RESPONSE', id, status: 400, body: { error: 'No space context set' } };
            const result = await this.spaceService.inviteMember(this.currentSpace.id, body.pubkey, body.name, origin);
            return { type: 'API_RESPONSE', id, status: 200, body: result };
        }

        return { type: 'API_RESPONSE', id, status: 404, body: { error: 'Route not found' } };
    }

    private matchRoute(pattern: string, path: string): { params: Record<string, string> } | null {
        // Simple regex matcher
        const keys: string[] = [];
        const regexStr = pattern.replace(/:([a-zA-Z]+)/g, (_, key) => {
            keys.push(key);
            return '([^\/]+)';
        });
        const regex = new RegExp(`^${regexStr}$`);
        const match = path.match(regex);

        if (!match) return null;

        const params: Record<string, string> = {};
        keys.forEach((key, i) => {
            params[key] = match[i + 1];
        });
        return { params };
    }

    private updateContext() {
        this.spaceService.updateContext({
            relays: this.relays,
            currentPubkey: this.currentPubkey,
            appOrigin: this.appOrigin,
            currentSpace: this.currentSpace
        });

        this.appService.updateContext({
            relays: this.relays,
            currentPubkey: this.currentPubkey,
            appOrigin: this.appOrigin,
            currentSpace: this.currentSpace
        });

        this.contactService.updateContext({
            relays: this.relays,
            currentPubkey: this.currentPubkey
        });

        this.directMessageService.updateContext({
            relays: this.relays,
            currentPubkey: this.currentPubkey
        });

        this.eventService.updateContext({
            relays: this.relays
        });

        this.storageService.updateContext({
            relays: this.relays,
            currentPubkey: this.currentPubkey,
            currentSpace: this.currentSpace
        });

        this.userService.updateContext({
            relays: this.relays,
            currentPubkey: this.currentPubkey
        });
    }

    private send(message: MirageMessage) {
        self.postMessage(message);
    }
}
