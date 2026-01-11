
import { describe, test, expect } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Expected routes that are valid.
 * Copied from/aligned with routes.test.ts
 */
const ALLOWED_ROUTES = [
    '/mirage/v1/ready',
    '/mirage/v1/events',
    '/mirage/v1/user/me',
    '/mirage/v1/users', // Base for users/:pubkey
    '/mirage/v1/spaces',
    '/mirage/v1/admin/spaces',
    '/mirage/v1/space', // Covers /space and /space/store etc if checking prefix
    '/mirage/v1/dms',
    '/mirage/v1/contacts',
    '/mirage/v1/admin/apps',
    '/mirage/v1/admin/state'
];

/**
 * Recursively find all .ts and .tsx files in a directory
 */
function getSourceFiles(dir: string): string[] {
    let results: string[] = [];
    const list = readdirSync(dir);

    for (const file of list) {
        if (file === 'node_modules' || file === 'dist' || file === 'build' || file.startsWith('.')) continue;

        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            results = results.concat(getSourceFiles(filePath));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(filePath);
        }
    }
    return results;
}

describe('Client API Usage', () => {
    test('Client does not use deprecated or invalid routes', () => {
        const webDir = '/home/spiralnights/code/mirage/packages/web/src';
        const files = getSourceFiles(webDir);
        const invalidUsages: string[] = [];

        // Regex to match host.request('METHOD', 'PATH') or similar
        // Matches strings that look like API paths starting with /mirage/v1/
        const apiPathRegex = /['"`](\/mirage\/v1\/[^'"`]+)['"`]/g;

        for (const file of files) {
            const content = readFileSync(file, 'utf-8');
            let match;

            while ((match = apiPathRegex.exec(content)) !== null) {
                const usedPath = match[1];

                // Handle dynamic template literals
                // e.g. /mirage/v1/profiles/${pubkey} -> /mirage/v1/profiles/
                const staticPart = usedPath.split('${')[0];

                // Simple prefix check
                // We check if the used path starts with any of the allowed routes
                // This handles /mirage/v1/users/abc123 (allowed if /mirage/v1/users is in list)
                const isAllowed = ALLOWED_ROUTES.some(allowed => staticPart.startsWith(allowed));

                // Special check for profiles vs users mismatch
                if (staticPart.includes('/profiles/')) {
                    invalidUsages.push(`File: ${file}\n  Used Invalid 'profiles' route (use 'users'): ${usedPath}`);
                    continue;
                }

                // Explicitly check for known legacy routes that might pass a prefix check if we aren't careful
                // e.g. /mirage/v1/admin/spaces/all starts with /mirage/v1/admin/spaces
                if (usedPath.endsWith('/all') && usedPath.includes('spaces')) {
                    invalidUsages.push(`File: ${file}\n  Used Legacy: ${usedPath}`);
                    continue;
                }

                if (!isAllowed) {
                    invalidUsages.push(`File: ${file}\n  Used Unknown: ${usedPath}`);
                }
            }
        }

        if (invalidUsages.length > 0) {
            console.error('Found invalid API route usage in client code:\n' + invalidUsages.join('\n'));
        }

        expect(invalidUsages).toEqual([]);
    });
});
