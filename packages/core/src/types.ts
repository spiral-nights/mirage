/**
 * Mirage Core - Shared Type Definitions
 *
 * Types for messages between Bridge, Engine, and Host.
 */

// ============================================================================
// Message Types (Bridge <-> Engine <-> Host)
// ============================================================================

export type MessageType =
    | 'API_REQUEST'
    | 'API_RESPONSE'
    | 'ACTION_SIGN_EVENT'
    | 'SIGNATURE_RESULT'
    | 'RELAY_CONFIG'
    | 'SET_PUBKEY'
    | 'STREAM_OPEN'
    | 'STREAM_CHUNK'
    | 'STREAM_CLOSE'
    | 'STREAM_ERROR'
    | 'ERROR';

export interface BaseMessage {
    type: MessageType;
    id: string;
}

/** API request from Bridge to Engine */
export interface ApiRequestMessage extends BaseMessage {
    type: 'API_REQUEST';
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: unknown;
    headers?: Record<string, string>;
}

/** API response from Engine to Bridge */
export interface ApiResponseMessage extends BaseMessage {
    type: 'API_RESPONSE';
    status: number;
    body: unknown;
    headers?: Record<string, string>;
}

/** Engine requests Host to sign an event */
export interface SignEventMessage extends BaseMessage {
    type: 'ACTION_SIGN_EVENT';
    event: UnsignedNostrEvent;
}

/** Host returns signature to Engine */
export interface SignatureResultMessage extends BaseMessage {
    type: 'SIGNATURE_RESULT';
    signedEvent?: NostrEvent;
    error?: string;
}

/** Relay configuration message */
export interface RelayConfigMessage extends BaseMessage {
    type: 'RELAY_CONFIG';
    action: 'SET' | 'ADD' | 'REMOVE';
    relays: string[];
}

/** Error message */
export interface ErrorMessage extends BaseMessage {
    type: 'ERROR';
    error: string;
    code?: string;
}

/** Set user pubkey message */
export interface SetPubkeyMessage extends BaseMessage {
    type: 'SET_PUBKEY';
    pubkey: string;
}

export type MirageMessage =
    | ApiRequestMessage
    | ApiResponseMessage
    | SignEventMessage
    | SignatureResultMessage
    | RelayConfigMessage
    | SetPubkeyMessage
    | SetPubkeyMessage
    | StreamOpenMessage
    | StreamChunkMessage
    | StreamCloseMessage
    | StreamErrorMessage
    | ErrorMessage;

/** Start a new stream (Bridge -> Engine) */
export interface StreamOpenMessage extends BaseMessage {
    type: 'STREAM_OPEN';
    method: 'GET';
    path: string;
    headers?: Record<string, string>;
}

/** Data chunk for a stream (Engine -> Bridge) */
export interface StreamChunkMessage extends BaseMessage {
    type: 'STREAM_CHUNK';
    chunk: string; // JSON string or serialized data
    done?: boolean;
}

/** Close a stream (Bridge -> Engine or Engine -> Bridge) */
export interface StreamCloseMessage extends BaseMessage {
    type: 'STREAM_CLOSE';
}

/** Stream error (Engine -> Bridge) */
export interface StreamErrorMessage extends BaseMessage {
    type: 'STREAM_ERROR';
    error: string;
}

// ============================================================================
// Nostr Event Types
// ============================================================================

export interface UnsignedNostrEvent {
    kind: number;
    content: string;
    tags: string[][];
    created_at: number;
    pubkey?: string;
}

export interface NostrEvent extends UnsignedNostrEvent {
    id: string;
    pubkey: string;
    sig: string;
}

// ============================================================================
// API Types
// ============================================================================

export interface UserProfile {
    pubkey: string;
    name?: string;
    displayName?: string;
    about?: string;
    picture?: string;
    nip05?: string;
    lud16?: string;
}

export interface FeedNote {
    id: string;
    pubkey: string;
    content: string;
    createdAt: number;
    tags: string[][];
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface MirageConfig {
    relays: string[];
}

// ============================================================================
// Permissions
// ============================================================================

export type Permission =
    | 'public_read'
    | 'public_write'
    | 'storage_read'
    | 'storage_write'
    | 'group_read'
    | 'group_write'
    | 'dm_read'
    | 'dm_write';

export interface AppPermissions {
    permissions: Permission[];
}

// ============================================================================
// NIP-07 Signer Interface
// ============================================================================

export interface Nip07Signer {
    getPublicKey(): Promise<string>;
    signEvent(event: UnsignedNostrEvent): Promise<NostrEvent>;
    nip04?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
}

declare global {
    interface Window {
        nostr?: Nip07Signer;
    }
}
