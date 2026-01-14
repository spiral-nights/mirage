import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { parsePermissions, isPathAllowed } from '../src/permissions';
import type { Permission } from '@mirage/core';

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

    test('allows all valid permission types', () => {
        const html = `
      <meta name="mirage-permissions" content="public_read, public_write, storage_read, storage_write, space_read, space_write, dm_read, dm_write">
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

    test('allows space routes with appropriate permissions', () => {
        const readPerms = { permissions: ['space_read' as const] };
        const writePerms = { permissions: ['space_write' as const] };

        expect(isPathAllowed('/mirage/v1/spaces', 'GET', readPerms)).toBe(true);
        expect(isPathAllowed('/mirage/v1/spaces/123/storage', 'PUT', writePerms)).toBe(true);
    });


    test('allows dm routes with appropriate permissions', () => {
        const readPerms = { permissions: ['dm_read' as const] };
        const writePerms = { permissions: ['dm_write' as const] };

        expect(isPathAllowed('/mirage/v1/dm/pubkey123', 'GET', readPerms)).toBe(true);
        expect(isPathAllowed('/mirage/v1/dm/pubkey123', 'POST', writePerms)).toBe(true);
    });

    test('denies admin routes for all permission combinations', () => {
        // Admin routes should NEVER be allowed for apps - no permission grants access
        const allPerms = {
            permissions: [
                'public_read' as const,
                'public_write' as const,
                'storage_read' as const,
                'storage_write' as const,
                'space_read' as const,
                'space_write' as const,
                'dm_read' as const,
                'dm_write' as const,
            ]
        };

        // App management routes
        expect(isPathAllowed('/mirage/v1/admin/apps', 'GET', allPerms)).toBe(false);
        expect(isPathAllowed('/mirage/v1/admin/apps', 'POST', allPerms)).toBe(false);
        expect(isPathAllowed('/mirage/v1/admin/apps/publish', 'POST', allPerms)).toBe(false);

        // Admin space routes
        expect(isPathAllowed('/mirage/v1/admin/spaces', 'GET', allPerms)).toBe(false);
        expect(isPathAllowed('/mirage/v1/admin/spaces/123', 'PUT', allPerms)).toBe(false);
        expect(isPathAllowed('/mirage/v1/admin/spaces/123/invitations', 'POST', allPerms)).toBe(false);
    });

    test('denies routes with no permissions', () => {
        const noPerms = { permissions: [] as Permission[] };

        expect(isPathAllowed('/mirage/v1/feed', 'GET', noPerms)).toBe(false);
        expect(isPathAllowed('/mirage/v1/storage/key', 'GET', noPerms)).toBe(false);
        expect(isPathAllowed('/mirage/v1/spaces', 'GET', noPerms)).toBe(false);
    });
});
