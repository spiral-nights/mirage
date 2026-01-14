/**
 * MirageScoper Tests
 */

import { describe, expect, test } from 'bun:test';
import { MirageScoper } from '../src/engine/MirageScoper';

describe('MirageScoper', () => {
    describe('getStorageDTag', () => {
        test('should return system-level d-tag without space', () => {
            const dTag = MirageScoper.getStorageDTag('mirage', undefined, 'app_list');
            expect(dTag).toBe('mirage:app_list');
        });

        test('should return space-scoped d-tag for non-system origin', () => {
            const dTag = MirageScoper.getStorageDTag('my-app', 'space123', 'settings');
            expect(dTag).toBe('my-app:space123:settings');
        });

        test('should return origin:key when no space but non-system origin', () => {
            const dTag = MirageScoper.getStorageDTag('my-app', undefined, 'settings');
            expect(dTag).toBe('my-app:settings');
        });

        test('should force system-level for mirage origin even with spaceId', () => {
            // SYSTEM_APP_ORIGIN always ignores spaceId for storage
            const dTag = MirageScoper.getStorageDTag('mirage', 'someSpace', 'app_list');
            expect(dTag).toBe('mirage:app_list');
        });
    });

    describe('getSpaceScopedId', () => {
        test('should return origin:spaceId format', () => {
            const scopedId = MirageScoper.getSpaceScopedId('my-app', 'space123');
            expect(scopedId).toBe('my-app:space123');
        });

        test('should handle long app origins', () => {
            const longOrigin = '30078:abc123def:mirage:app:uuid-1234';
            const scopedId = MirageScoper.getSpaceScopedId(longOrigin, 'space456');
            expect(scopedId).toBe('30078:abc123def:mirage:app:uuid-1234:space456');
        });
    });

    describe('getInternalDTag', () => {
        test('should return mirage-prefixed d-tag', () => {
            const dTag = MirageScoper.getInternalDTag('space_keys');
            expect(dTag).toBe('mirage:space_keys');
        });
    });

    describe('parseScopedId', () => {
        test('should parse simple scoped ID', () => {
            const result = MirageScoper.parseScopedId('my-app:space123');
            expect(result).toEqual({ origin: 'my-app', spaceId: 'space123' });
        });

        test('should parse complex origin with multiple colons', () => {
            // The lastIndexOf ensures we split correctly
            const result = MirageScoper.parseScopedId('30078:abc:identifier:space123');
            expect(result).toEqual({ origin: '30078:abc:identifier', spaceId: 'space123' });
        });

        test('should return null for invalid format without colon', () => {
            const result = MirageScoper.parseScopedId('invalid');
            expect(result).toBeNull();
        });
    });
});
