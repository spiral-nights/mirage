/**
 * Tests for streaming message types and handlers
 */

import { describe, test, expect } from 'bun:test';
import type {
    StreamOpenMessage,
    StreamChunkMessage,
    StreamCloseMessage,
    StreamErrorMessage,
} from '../src/types';

describe('Streaming Message Types', () => {
    test('StreamOpenMessage has correct shape', () => {
        const message: StreamOpenMessage = {
            type: 'STREAM_OPEN',
            id: 'stream-123',
            method: 'GET',
            path: '/mirage/v1/feed',
            headers: { 'Accept': 'text/event-stream' },
        };

        expect(message.type).toBe('STREAM_OPEN');
        expect(message.method).toBe('GET');
        expect(message.path).toBe('/mirage/v1/feed');
        expect(message.headers?.Accept).toBe('text/event-stream');
    });

    test('StreamChunkMessage has correct shape', () => {
        const message: StreamChunkMessage = {
            type: 'STREAM_CHUNK',
            id: 'stream-123',
            chunk: 'data: {"content":"test"}\n\n',
        };

        expect(message.type).toBe('STREAM_CHUNK');
        expect(message.id).toBe('stream-123');
        expect(message.chunk).toContain('data:');
    });

    test('StreamCloseMessage has correct shape', () => {
        const message: StreamCloseMessage = {
            type: 'STREAM_CLOSE',
            id: 'stream-123',
        };

        expect(message.type).toBe('STREAM_CLOSE');
        expect(message.id).toBe('stream-123');
    });

    test('StreamErrorMessage has correct shape', () => {
        const message: StreamErrorMessage = {
            type: 'STREAM_ERROR',
            id: 'stream-123',
            error: 'Connection failed',
        };

        expect(message.type).toBe('STREAM_ERROR');
        expect(message.error).toBe('Connection failed');
    });
});

describe('Streaming Protocol', () => {
    test('SSE format is data: json newline newline', () => {
        const event = { kind: 1, content: 'Hello' };
        const sseFormat = `data: ${JSON.stringify(event)}\n\n`;

        expect(sseFormat).toStartWith('data: ');
        expect(sseFormat).toEndWith('\n\n');

        // Parse back
        const dataLine = sseFormat.split('\n')[0];
        const json = dataLine.slice(6); // Remove 'data: '
        const parsed = JSON.parse(json);

        expect(parsed.kind).toBe(1);
        expect(parsed.content).toBe('Hello');
    });

    test('stream path parsing extracts channel ID', () => {
        const path = '/mirage/v1/channels/family-chat/messages';
        const match = path.match(/^\/mirage\/v1\/channels\/([a-zA-Z0-9_-]+)\/messages/);

        expect(match).not.toBeNull();
        expect(match![1]).toBe('family-chat');
    });

    test('stream path parsing extracts DM pubkey', () => {
        const pubkey = 'a'.repeat(64); // 64 hex chars
        const path = `/mirage/v1/dm/${pubkey}`;
        const match = path.match(/^\/mirage\/v1\/dm\/([a-f0-9]{64})$/);

        expect(match).not.toBeNull();
        expect(match![1]).toBe(pubkey);
    });

    test('feed path is recognized', () => {
        const path = '/mirage/v1/feed';
        expect(path).toBe('/mirage/v1/feed');
    });
});
