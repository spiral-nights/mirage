// Mock DOM environment for Host tests
if (typeof window === 'undefined') {
    (globalThis as any).window = {
        addEventListener: () => {},
        removeEventListener: () => {},
        location: { origin: 'http://localhost' }
    };
}

if (typeof Worker === 'undefined') {
    (globalThis as any).Worker = class MockWorker {
        onmessage = null;
        onerror = null;
        postMessage() {}
        terminate() {}
    };
}

if (typeof crypto === 'undefined') {
    (globalThis as any).crypto = {
        randomUUID: () => Math.random().toString(36).substring(7)
    };
}
