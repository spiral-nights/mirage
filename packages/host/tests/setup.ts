// Mock DOM environment for Host tests
if (typeof window === 'undefined') {
    const mockWindow = {
        addEventListener: () => {},
        removeEventListener: () => {},
        location: { origin: 'http://localhost', hostname: 'localhost' },
        localStorage: {
            getItem: (key: string) => (globalThis as any)._storage?.[key] || null,
            setItem: (key: string, val: string) => {
                if (!(globalThis as any)._storage) (globalThis as any)._storage = {};
                (globalThis as any)._storage[key] = val;
            },
            removeItem: (key: string) => {
                if ((globalThis as any)._storage) delete (globalThis as any)._storage[key];
            }
        }
    };
    (globalThis as any).window = mockWindow;
    (globalThis as any).localStorage = mockWindow.localStorage;
    (global as any).window = mockWindow;
    (global as any).localStorage = mockWindow.localStorage;
}

if (typeof navigator === 'undefined') {
    (globalThis as any).navigator = {
        credentials: {
            create: async () => { throw new Error("Mock not implemented"); },
            get: async () => { throw new Error("Mock not implemented"); }
        }
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
