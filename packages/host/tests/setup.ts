// Mock DOM environment for Host tests

// Always overwrite globals to ensure mock is active
const listeners: Record<string, Function[]> = {};
const mockWindow = {
    addEventListener: (event: string, cb: Function) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(cb);
    },
    removeEventListener: (event: string, cb: Function) => {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter(l => l !== cb);
    },
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

(globalThis as any).navigator = {
    credentials: {
        create: async () => { throw new Error("Mock not implemented"); },
        get: async () => { throw new Error("Mock not implemented"); }
    }
};

(globalThis as any).Worker = class MockWorker {
    onmessage = null;
    onerror = null;
    postMessage() { }
    terminate() { }
};

(globalThis as any).crypto = {
    randomUUID: () => Math.random().toString(36).substring(7),
    getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
    },
    subtle: {
        importKey: async (_fmt: string, keyData: BufferSource) => {
            return { _key: new Uint8Array(keyData as ArrayBuffer) };
        },
        encrypt: async (_algo: any, key: any, data: BufferSource) => {
            const input = new Uint8Array(data as ArrayBuffer);
            const k = key._key;
            const res = new Uint8Array(input.length);
            for (let i = 0; i < input.length; i++) {
                res[i] = input[i] ^ (k[i % k.length] || 0);
            }
            return res.buffer;
        },
        decrypt: async (_algo: any, key: any, data: BufferSource) => {
            const input = new Uint8Array(data as ArrayBuffer);
            const k = key._key;
            const res = new Uint8Array(input.length);
            for (let i = 0; i < input.length; i++) {
                res[i] = input[i] ^ (k[i % k.length] || 0);
            }
            return res.buffer;
        }
    }
};
