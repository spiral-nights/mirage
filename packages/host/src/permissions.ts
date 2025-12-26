/**
 * Mirage Host - Permissions Parser
 *
 * Parses and validates app permission manifests from HTML meta tags.
 */

import type { Permission, AppPermissions } from '@mirage/core';

const VALID_PERMISSIONS: Permission[] = [
    'public_read',
    'public_write',
    'storage_read',
    'storage_write',
    'space_read',
    'space_write',
    'dm_read',
    'dm_write',
];

/**
 * Parse permissions from app HTML content
 */
export function parsePermissions(html: string): AppPermissions {
    const permissions: Permission[] = [];

    // Look for <meta name="mirage-permissions" content="...">
    const metaMatch = html.match(
        /<meta\s+name=["']mirage-permissions["']\s+content=["']([^"']+)["']/i
    );

    if (metaMatch) {
        const rawPermissions = metaMatch[1].split(',').map((p) => p.trim());

        for (const perm of rawPermissions) {
            if (VALID_PERMISSIONS.includes(perm as Permission)) {
                permissions.push(perm as Permission);
            } else {
                console.warn(`[Permissions] Unknown permission: ${perm}`);
            }
        }
    }

    return { permissions };
}

/**
 * Check if a path is allowed by permissions
 */
export function isPathAllowed(path: string, method: string, permissions: AppPermissions): boolean {
    const { permissions: perms } = permissions;

    // /mirage/v1/feed
    if (path.startsWith('/mirage/v1/feed')) {
        if (method === 'GET') return perms.includes('public_read');
        if (method === 'POST') return perms.includes('public_write');
    }

    // /mirage/v1/user
    if (path.startsWith('/mirage/v1/user')) {
        return perms.includes('public_read');
    }

    // /mirage/v1/storage
    if (path.startsWith('/mirage/v1/storage')) {
        if (method === 'GET') return perms.includes('storage_read');
        if (method === 'PUT' || method === 'DELETE') return perms.includes('storage_write');
    }

    // /mirage/v1/spaces
    if (path.startsWith('/mirage/v1/spaces')) {
        if (method === 'GET') return perms.includes('space_read');
        if (method === 'PUT' || method === 'POST') return perms.includes('space_write');
    }

    // /mirage/v1/dm
    if (path.startsWith('/mirage/v1/dm')) {
        if (method === 'GET') return perms.includes('dm_read');
        if (method === 'POST') return perms.includes('dm_write');
    }

    return false;
}
