/**
 * Mirage Host - Development Server
 *
 * Simple Bun server for local development and testing.
 */

const server = Bun.serve({
    port: 5173,

    async fetch(request) {
        const url = new URL(request.url);
        let path = url.pathname;

        // Serve index as demo page
        if (path === '/') {
            path = '/examples/demo-host.html';
        }

        // Map paths to files
        let filePath: string;

        if (path.startsWith('/packages/')) {
            filePath = `../../${path}`;
        } else if (path.startsWith('/examples/')) {
            filePath = `../../${path}`;
        } else {
            filePath = `../../${path}`;
        }

        try {
            const file = Bun.file(new URL(filePath, import.meta.url).pathname);
            const exists = await file.exists();

            if (!exists) {
                return new Response('Not Found', { status: 404 });
            }

            // Determine content type
            let contentType = 'application/octet-stream';
            if (path.endsWith('.html')) contentType = 'text/html';
            else if (path.endsWith('.js')) contentType = 'application/javascript';
            else if (path.endsWith('.ts')) contentType = 'application/javascript';
            else if (path.endsWith('.css')) contentType = 'text/css';
            else if (path.endsWith('.json')) contentType = 'application/json';

            return new Response(file, {
                headers: {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            console.error('Error serving file:', error);
            return new Response('Internal Server Error', { status: 500 });
        }
    },
});

console.log(`🏜️ Mirage Dev Server running at http://localhost:${server.port}`);
