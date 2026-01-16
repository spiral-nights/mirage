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
    | 'SET_APP_ORIGIN'
    | 'SET_SPACE_CONTEXT'
    | 'STREAM_OPEN'
    | 'STREAM_CHUNK'
    | 'STREAM_CLOSE'
    | 'STREAM_ERROR'
    | 'ACTION_ENCRYPT'
    | 'ENCRYPT_RESULT'
    | 'ACTION_DECRYPT'
    | 'DECRYPT_RESULT'
    | 'ACTION_FETCH_APP'
    | 'FETCH_APP_RESULT'
    | 'ACTION_SET_SESSION_KEY'
    | 'ACTION_GET_RELAY_STATUS'
    | 'RELAY_STATUS_RESULT'
    | 'NEW_SPACE_INVITE'
    | 'ERROR';

export interface BaseMessage {
    type: MessageType;
    id: string;
}

/** Injects an ephemeral space key into the Engine session */
export interface SetSessionKeyMessage extends BaseMessage {
    type: 'ACTION_SET_SESSION_KEY';
    spaceId: string;
    key: string;
}

/** Request to fetch an app by naddr */
export interface FetchAppRequestMessage extends BaseMessage {
    type: 'ACTION_FETCH_APP';
    naddr: string;
}

/** Result of app fetch */
export interface FetchAppResultMessage extends BaseMessage {
    type: 'FETCH_APP_RESULT';
    html?: string;
    error?: string;
}

/** Request relay stats from Engine */
export interface GetRelayStatusMessage extends BaseMessage {
    type: 'ACTION_GET_RELAY_STATUS';
}

export interface RelayStat {
    url: string;
    status: 'connected' | 'connecting' | 'disconnected' | 'error';
}

/** Relay stats result */
export interface RelayStatusResultMessage extends BaseMessage {
    type: 'RELAY_STATUS_RESULT';
    stats: RelayStat[];
}

/** New space invite received */
export interface NewSpaceInviteMessage extends BaseMessage {
    type: 'NEW_SPACE_INVITE';
    spaceId: string;
    spaceName?: string;
}

/** API request from Bridge to Engine */
export interface ApiRequestMessage extends BaseMessage {
    type: 'API_REQUEST';
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    body?: unknown;
    headers?: Record<string, string>;
    origin?: string; // Stamped by Host
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

/** Set app origin/identifier message */
export interface SetAppOriginMessage extends BaseMessage {
    type: 'SET_APP_ORIGIN';
    origin: string;  // The app's naddr or unique identifier
}

/** Set space context message */
export interface SetSpaceContextMessage extends BaseMessage {
    type: 'SET_SPACE_CONTEXT';
    spaceId: string;
    spaceName: string;
}

export type MirageMessage =
    | ApiRequestMessage
    | ApiResponseMessage
    | SignEventMessage
    | SignatureResultMessage
    | RelayConfigMessage
    | SetPubkeyMessage
    | SetAppOriginMessage
    | SetSpaceContextMessage
    | StreamOpenMessage
    | StreamChunkMessage
    | StreamCloseMessage
    | StreamErrorMessage
    | EncryptRequestMessage
    | EncryptResultMessage
    | DecryptRequestMessage
    | DecryptResultMessage
    | FetchAppRequestMessage
    | FetchAppResultMessage
    | SetSessionKeyMessage
    | GetRelayStatusMessage
    | RelayStatusResultMessage
    | NewSpaceInviteMessage
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
    origin?: string; // Stamped by Host
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
// Space Types (Encrypted Shared Workspaces)
// ============================================================================

/**
 * A space (encrypted group) that this app has access to
 */
export interface Space {
    id: string;
    name: string;
    createdAt: number;
    memberCount: number;
    appOrigin?: string;  // The naddr or identifier of the app that created this space
    offline?: boolean;   // Whether this space stores data locally only (no relays)
}

/**
 * A message in a space - can be a regular message or system notification
 */
export interface SpaceMessage {
    id: string;
    spaceId: string;
    author: string;
    content: string;
    type: 'message' | 'system';
    createdAt: number;
}

/**
 * Real-time update for the Shared KV Store
 */
export interface StoreUpdate {
    key: string;
    value: unknown;
}

/**
 * System event payload (content of system messages)
 */
export type SystemEvent =
    | { action: 'member_joined'; pubkey: string; invitedBy: string }
    | { action: 'space_created'; name: string; createdBy: string }
    | { action: 'space_renamed'; oldName: string; newName: string };

/**
 * Space metadata stored locally (encrypted)
 */
export interface SpaceKey {
    key: string;  // Base64 encoded symmetric key
    version: number;
    name?: string;  // Space name for display
    createdAt?: number;  // When the space was created
    deleted?: boolean; // If true, ignore this space (tombstone)
    deletedAt?: number; // Timestamp of deletion
    latestInviteTimestamp?: number; // Timestamp of the last accepted invite (for handling backdated invites)
    offline?: boolean; // Whether this space stores data locally only (no relays)
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
    | 'space_read'
    | 'space_write'
    | 'spaces_read'   // Alias for space_read
    | 'spaces_write'  // Alias for space_write
    | 'dm_read'
    | 'dm_write';

export interface AppPermissions {
    permissions: Permission[];
}

export interface AppDefinition {
    naddr: string;
    name: string;
    createdAt: number;
    offline?: boolean;
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