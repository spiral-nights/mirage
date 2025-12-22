import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { parsePermissions, isPathAllowed } from '../src/permissions';

describe('parsePermissions', () => {
    test('parses valid permissions from meta tag', () => {
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="mirage-permissions" content="public_read, storage_write">
      </head>
      <body></body>
      </html>
    `;

        const result = parsePermissions(html);
        expect(result.permissions).toEqual(['public_read', 'storage_write']);
    });

    test('handles empty permissions', () => {
        const html = `
      <!DOCTYPE html>
      <html><head></head><body></body></html>
    `;

        const result = parsePermissions(html);
        expect(result.permissions).toEqual([]);
    });

    test('ignores invalid permissions', () => {
        const html = `
      <meta name="mirage-permissions" content="public_read, invalid_perm, storage_write">
    `;

        const result = parsePermissions(html);
        expect(result.permissions).toEqual(['public_read', 'storage_write']);
    });

    test('handles all valid permission types', () => {
        const html = `
      <meta name="mirage-permissions" content="public_read, public_write, storage_read, storage_write, group_read, group_write, dm_read, dm_write">
    `;

        const result = parsePermissions(html);
        expect(result.permissions).toHaveLength(8);
    });
});

describe('isPathAllowed', () => {
    test('allows feed GET with public_read', () => {
        const permissions = { permissions: ['public_read' as const] };
        expect(isPathAllowed('/mirage/v1/feed', 'GET', permissions)).toBe(true);
    });

    test('denies feed POST without public_write', () => {
        const permissions = { permissions: ['public_read' as const] };
        expect(isPathAllowed('/mirage/v1/feed', 'POST', permissions)).toBe(false);
    });

    test('allows feed POST with public_write', () => {
        const permissions = { permissions: ['public_write' as const] };
        expect(isPathAllowed('/mirage/v1/feed', 'POST', permissions)).toBe(true);
    });

    test('allows user routes with public_read', () => {
        const permissions = { permissions: ['public_read' as const] };
        expect(isPathAllowed('/mirage/v1/user/me', 'GET', permissions)).toBe(true);
    });

    test('allows storage GET with storage_read', () => {
        const permissions = { permissions: ['storage_read' as const] };
        expect(isPathAllowed('/mirage/v1/storage/mykey', 'GET', permissions)).toBe(true);
    });

    test('denies storage PUT without storage_write', () => {
        const permissions = { permissions: ['storage_read' as const] };
        expect(isPathAllowed('/mirage/v1/storage/mykey', 'PUT', permissions)).toBe(false);
    });

    test('allows group routes with appropriate permissions', () => {
        const readPerms = { permissions: ['group_read' as const] };
        const writePerms = { permissions: ['group_write' as const] };

        expect(isPathAllowed('/mirage/v1/groups', 'GET', readPerms)).toBe(true);
        expect(isPathAllowed('/mirage/v1/groups/123/storage', 'PUT', writePerms)).toBe(true);
    });

    test('allows dm routes with appropriate permissions', () => {
        const readPerms = { permissions: ['dm_read' as const] };
        const writePerms = { permissions: ['dm_write' as const] };

        expect(isPathAllowed('/mirage/v1/dm/pubkey123', 'GET', readPerms)).toBe(true);
        expect(isPathAllowed('/mirage/v1/dm/pubkey123', 'POST', writePerms)).toBe(true);
    });
});
