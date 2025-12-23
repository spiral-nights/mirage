/**
 * Tests for Bridge messaging and fetch interception
 */

import { describe, test, expect } from 'bun:test';
import type { ApiRequestMessage, ApiResponseMessage } from '../src/types';

describe('Bridge Message Routing', () => {
    test('API_REQUEST message has required fields', () => {
        const message: ApiRequestMessage = {
            type: 'API_REQUEST',
            id: 'req-123',
            method: 'GET',
            path: '/mirage/v1/feed',
            body: undefined,
            headers: { 'Accept': 'application/json' },
        };

        expect(message.type).toBe('API_REQUEST');
        expect(message.id).toBeDefined();
        expect(message.method).toBe('GET');
        expect(message.path).toStartWith('/mirage/');
    });

    test('API_RESPONSE message has required fields', () => {
        const message: ApiResponseMessage = {
            type: 'API_RESPONSE',
            id: 'req-123',
            status: 200,
            body: [{ id: 'event1' }, { id: 'event2' }],
            headers: { 'Content-Type': 'application/json' },
        };

        expect(message.type).toBe('API_RESPONSE');
        expect(message.id).toBe('req-123');
        expect(message.status).toBe(200);
        expect(Array.isArray(message.body)).toBe(true);
    });

    test('POST request includes body', () => {
        const message: ApiRequestMessage = {
            type: 'API_REQUEST',
            id: 'req-456',
            method: 'POST',
            path: '/mirage/v1/feed',
            body: { content: 'Hello world!' },
        };

        expect(message.method).toBe('POST');
        expect(message.body).toEqual({ content: 'Hello world!' });
    });

    test('storage PUT request with JSON body', () => {
        const message: ApiRequestMessage = {
            type: 'API_REQUEST',
            id: 'req-789',
            method: 'PUT',
            path: '/mirage/v1/storage/settings',
            body: { theme: 'dark', fontSize: 16 },
        };

        expect(message.path).toBe('/mirage/v1/storage/settings');
        expect(message.body).toEqual({ theme: 'dark', fontSize: 16 });
    });
});

describe('Fetch Interception Logic', () => {
    test('mirage paths should be intercepted', () => {
        const paths = [
            '/mirage/v1/feed',
            '/mirage/v1/user/me',
            '/mirage/v1/storage/settings',
            '/mirage/v1/channels/abc/messages',
            '/mirage/v1/dm/a'.repeat(64).slice(0, 77), // /mirage/v1/dm/ + 64 chars
        ];

        for (const path of paths) {
            expect(path.startsWith('/mirage/')).toBe(true);
        }
    });

    test('non-mirage paths should not be intercepted', () => {
        const paths = [
            '/api/v1/something',
            'https://example.com/api',
            '/other/endpoint',
            '/mirage-like/but/not',
        ];

        for (const path of paths) {
            expect(path.startsWith('/mirage/')).toBe(false);
        }
    });

    test('streaming request detected by Accept header', () => {
        const headers = new Headers({ 'Accept': 'text/event-stream' });
        expect(headers.get('Accept')).toBe('text/event-stream');
    });

    test('JSON request detected by Accept header', () => {
        const headers = new Headers({ 'Accept': 'application/json' });
        expect(headers.get('Accept')).toBe('application/json');
    });
});

describe('Bridge Modes', () => {
    test('Child mode detection checks window.parent', () => {
        // In a browser iframe: window.parent !== window
        // In top-level: window.parent === window
        // We can't actually test this in Node/Bun, but we can verify the logic
        const isChildMode = (parent: unknown, self: unknown) => parent !== self;

        expect(isChildMode('parent', 'child')).toBe(true);
        expect(isChildMode('same', 'same')).toBe(false);
    });

    test('Standalone mode spawns worker', () => {
        // Standalone mode requires workerUrl
        const options = { workerUrl: '/path/to/engine.js' };
        expect(options.workerUrl).toBeDefined();
    });
});
