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
    | 'ACTION_ENCRYPT'
    | 'ENCRYPT_RESULT'
    | 'ACTION_DECRYPT'
    | 'DECRYPT_RESULT'
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
    | StreamOpenMessage
    | StreamChunkMessage
    | StreamCloseMessage
    | StreamErrorMessage
    | EncryptRequestMessage
    | EncryptResultMessage
    | DecryptRequestMessage
    | DecryptResultMessage
    | ErrorMessage;

// ============================================================================
// Streaming Messages
// ============================================================================

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
// NIP-44 Encryption Messages (Engine <-> Host)
// ============================================================================

/** Request NIP-44 encryption from Host */
export interface EncryptRequestMessage extends BaseMessage {
    type: 'ACTION_ENCRYPT';
    pubkey: string;      // Recipient pubkey (or self for self-encryption)
    plaintext: string;
}

/** Encryption result from Host */
export interface EncryptResultMessage extends BaseMessage {
    type: 'ENCRYPT_RESULT';
    ciphertext?: string;
    error?: string;
}

/** Request NIP-44 decryption from Host */
export interface DecryptRequestMessage extends BaseMessage {
    type: 'ACTION_DECRYPT';
    pubkey: string;      // Sender pubkey (or self for self-decryption)
    ciphertext: string;
}

/** Decryption result from Host */
export interface DecryptResultMessage extends BaseMessage {
    type: 'DECRYPT_RESULT';
    plaintext?: string;
    error?: string;
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
// Channel Types (Encrypted Group Messaging)
// ============================================================================

/**
 * A channel (encrypted group) that this app has access to
 */
export interface Channel {
    id: string;
    name: string;
    createdAt: number;
    memberCount: number;
}

/**
 * A message in a channel - can be a regular message or system notification
 */
export interface ChannelMessage {
    id: string;
    channelId: string;
    author: string;
    content: string;
    type: 'message' | 'system';
    createdAt: number;
}

/**
 * System event payload (content of system messages)
 */
export type SystemEvent =
    | { action: 'member_joined'; pubkey: string; invitedBy: string }
    | { action: 'member_left'; pubkey: string }
    | { action: 'member_removed'; pubkey: string; removedBy: string }
    | { action: 'key_rotated'; version: number }
    | { action: 'channel_created'; name: string; createdBy: string }
    | { action: 'channel_renamed'; oldName: string; newName: string };

/**
 * Channel metadata stored locally (encrypted)
 */
export interface ChannelKey {
    key: string;  // Base64 encoded symmetric key
    version: number;
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
    /** NIP-04 encryption (legacy, deprecated) */
    nip04?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
    /** NIP-44 encryption (recommended) */
    nip44?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>;
        decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
}

declare global {
    interface Window {
        nostr?: Nip07Signer;
    }
}
