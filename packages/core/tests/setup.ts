/**
 * Preload script for Bun test runner.
 * Sets up fake-indexeddb globals BEFORE any other modules load.
 */
import { indexedDB, IDBKeyRange } from "fake-indexeddb";
import Dexie from 'dexie';

// Set up globals
const mockWindow = {
    indexedDB,
    IDBKeyRange,
    postMessage: () => { } // Mock for Worker context
};

(globalThis as any).indexedDB = indexedDB;
(globalThis as any).IDBKeyRange = IDBKeyRange;
(globalThis as any).window = mockWindow;
(globalThis as any).self = mockWindow;

// Configure Dexie
Dexie.dependencies.indexedDB = indexedDB;
Dexie.dependencies.IDBKeyRange = IDBKeyRange;

console.log('[Test Setup] fake-indexeddb configured');
