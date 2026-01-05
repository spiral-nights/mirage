// Minimal service worker for PWA installability
// Does not provide offline support - just enough to make the app installable

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Pass through all requests - no caching/offline support
    event.respondWith(fetch(event.request));
});
