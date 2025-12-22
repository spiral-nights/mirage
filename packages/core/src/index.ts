/**
 * @mirage/core
 *
 * The Mirage Nostr App Engine - Core Package
 *
 * Exports the Bridge and Engine for building Nostr-powered apps.
 */

// Types
export * from './types';

// Bridge
export { initBridge, destroyBridge, sendToWorker, type BridgeOptions } from './bridge/index';

// Engine components (for advanced usage)
export { RelayPool, type RelayPoolOptions } from './engine/relay-pool';
