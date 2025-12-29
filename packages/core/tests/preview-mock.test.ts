/**
 * Unit tests for preview-mock module - Complete API coverage
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import {
    handlePreviewRequest,
    clearPreviewData,
    previewSpaces,
    previewMessages,
    previewStore,
    previewStorage,
    previewContacts,
    previewDMs,
    previewEvents,
    previewLibrary,
    PREVIEW_PUBKEY,
} from '../src/bridge/preview-mock';

describe('Preview Mock', () => {
    beforeEach(() => {
        clearPreviewData();
    });

    describe('System', () => {
        test('GET /ready returns ready status', async () => {
            const res = await handlePreviewRequest('GET', '/mirage/v1/ready');
            const data = await res.json();
            expect(data.ready).toBe(true);
            expect(data.authenticated).toBe(true);
        });

        test('GET /events returns events array', async () => {
            const res = await handlePreviewRequest('GET', '/mirage/v1/events');
            const data = await res.json();
            expect(Array.isArray(data)).toBe(true);
        });

        test('POST /events creates event with correct shape', async () => {
            const res = await handlePreviewRequest('POST', '/mirage/v1/events', {
                kind: 1,
                content: 'Hello world',
                tags: [['t', 'test']],
            });
            expect(res.status).toBe(201);
            const data = await res.json();
            expect(data.id).toHaveLength(64);
            expect(data.kind).toBe(1);
            expect(data.content).toBe('Hello world');
            expect(data.pubkey).toBe(PREVIEW_PUBKEY);
        });
    });

    describe('User/Profiles', () => {
        test('GET /user/me returns preview profile', async () => {
            const res = await handlePreviewRequest('GET', '/mirage/v1/user/me');
            const data = await res.json();
            expect(data.pubkey).toBe(PREVIEW_PUBKEY);
            expect(data.name).toBe('Preview User');
        });

        test('GET /profiles/:pubkey returns mock profile', async () => {
            const res = await handlePreviewRequest('GET', '/mirage/v1/profiles/abc123');
            const data = await res.json();
            expect(data.pubkey).toBe('abc123');
            expect(data.name).toContain('User');
        });
    });

    describe('Contacts', () => {
        test('GET /contacts returns empty array initially', async () => {
            const res = await handlePreviewRequest('GET', '/mirage/v1/contacts');
            const data = await res.json();
            expect(data).toEqual([]);
        });

        test('PUT /contacts updates contact list', async () => {
            await handlePreviewRequest('PUT', '/mirage/v1/contacts', {
                contacts: [{ pubkey: 'friend1' }, { pubkey: 'friend2' }],
            });
            expect(previewContacts.length).toBe(2);
        });
    });

    describe('Storage', () => {
        test('PUT then GET /storage/:key', async () => {
            await handlePreviewRequest('PUT', '/mirage/v1/storage/settings', { theme: 'dark' });
            const res = await handlePreviewRequest('GET', '/mirage/v1/storage/settings');
            const data = await res.json();
            expect(data).toEqual({ theme: 'dark' });
        });

        test('DELETE /storage/:key removes value', async () => {
            await handlePreviewRequest('PUT', '/mirage/v1/storage/temp', { data: 1 });
            await handlePreviewRequest('DELETE', '/mirage/v1/storage/temp');
            expect(previewStorage.has('temp')).toBe(false);
        });
    });

    describe('Spaces', () => {
        test('POST /spaces creates space', async () => {
            const res = await handlePreviewRequest('POST', '/mirage/v1/spaces', { name: 'Test' });
            expect(res.status).toBe(201);
            const data = await res.json();
            expect(data.name).toBe('Test');
            expect(previewSpaces.size).toBe(1);
        });

        test('GET /spaces/:id returns single space', async () => {
            const createRes = await handlePreviewRequest('POST', '/mirage/v1/spaces', { name: 'S1' });
            const space = await createRes.json();

            const res = await handlePreviewRequest('GET', `/mirage/v1/spaces/${space.id}`);
            const data = await res.json();
            expect(data.id).toBe(space.id);
        });

        test('DELETE /spaces/:id removes space', async () => {
            const createRes = await handlePreviewRequest('POST', '/mirage/v1/spaces', { name: 'S1' });
            const space = await createRes.json();

            await handlePreviewRequest('DELETE', `/mirage/v1/spaces/${space.id}`);
            expect(previewSpaces.has(space.id)).toBe(false);
        });
    });

    describe('Space Messages', () => {
        test('POST /spaces/:id/messages with correct shape', async () => {
            const res = await handlePreviewRequest('POST', '/mirage/v1/spaces/s1/messages', {
                content: 'Hello',
            });
            expect(res.status).toBe(201);
            const data = await res.json();
            expect(data.spaceId).toBe('s1');
            expect(data.author).toBe(PREVIEW_PUBKEY);
            expect(data.type).toBe('message');
        });
    });

    describe('DMs', () => {
        test('POST /dms/:pubkey sends message', async () => {
            const res = await handlePreviewRequest('POST', '/mirage/v1/dms/alice', {
                content: 'Hi Alice!',
            });
            expect(res.status).toBe(201);
            const data = await res.json();
            expect(data.recipient).toBe('alice');
            expect(previewDMs.get('alice')?.length).toBe(1);
        });

        test('GET /dms returns conversations', async () => {
            await handlePreviewRequest('POST', '/mirage/v1/dms/bob', { content: 'Hi' });
            const res = await handlePreviewRequest('GET', '/mirage/v1/dms');
            const data = await res.json();
            expect(data.length).toBe(1);
            expect(data[0].pubkey).toBe('bob');
        });
    });

    describe('Library', () => {
        test('POST /library/apps adds app', async () => {
            const res = await handlePreviewRequest('POST', '/mirage/v1/library/apps', {
                naddr: 'naddr123',
                name: 'My App',
            });
            expect(res.status).toBe(201);
            expect(previewLibrary.length).toBe(1);
        });
    });

    describe('clearPreviewData', () => {
        test('clears all storage', async () => {
            await handlePreviewRequest('POST', '/mirage/v1/spaces', { name: 'S1' });
            await handlePreviewRequest('POST', '/mirage/v1/dms/alice', { content: 'Hi' });
            await handlePreviewRequest('PUT', '/mirage/v1/storage/key', { v: 1 });

            clearPreviewData();

            expect(previewSpaces.size).toBe(0);
            expect(previewDMs.size).toBe(0);
            expect(previewStorage.size).toBe(0);
        });
    });
});
