/**
 * Mirage Bridge - Message Routing
 *
 * Handles message passing between Bridge and Engine/Host.
 */

import type { MirageMessage } from '../types';
import { nip04, nip44, getPublicKey, finalizeEvent } from 'nostr-tools';

// ============================================================================
// Types
// ============================================================================

export interface PendingRequest {
    resolve: (response: Response) => void;
    reject: (error: Error) => void;
}

export interface ActiveStream {
    controller: {
        enqueue(chunk: Uint8Array): void;
        close(): void;
        error(err: Error): void;
    };
}

// ============================================================================
// State
// ============================================================================

export let enginePort: MessagePort | Worker | Window | null = null;
export let isChildMode = false;
let engineReadyResolve: () => void;

// Local Signer State
let privateKeyBytes: Uint8Array | null = null;
let publicKey: string | null = null;

function hexToBytes(hex: string): Uint8Array {
    let bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

export function setPrivateKey(key: string): void {
    try {
        if (key) {
            privateKeyBytes = hexToBytes(key);
            publicKey = getPublicKey(privateKeyBytes);
            console.log('[Bridge] Private key set for standalone mode:', publicKey.slice(0, 8) + '...');
        }
    } catch (e) {
        console.error('[Bridge] Invalid private key:', e);
    }
}

export const engineReady = new Promise<void>((resolve) => {
    engineReadyResolve = resolve;
});

export const pendingRequests = new Map<string, PendingRequest>();
export const activeStreams = new Map<string, ActiveStream>();
export const originalFetch = window.fetch.bind(window);

// ============================================================================
// State Setters (for initialization)
// ============================================================================

export function setEnginePort(port: MessagePort | Worker | Window | null): void {
    enginePort = port;
}

export function setChildMode(value: boolean): void {
    isChildMode = value;
}

export function signalEngineReady(): void {
    engineReadyResolve();
}

// ============================================================================
// Message Handlers
// ============================================================================

/**
 * Handle messages coming FROM the Engine (or Host acting as Engine)
 */
export function handleEngineMessage(event: MessageEvent<MirageMessage>): void {
    const message = event.data;

    // Route: API Response
    if (message.type === 'API_RESPONSE') {
        const pending = pendingRequests.get(message.id);
        if (pending) {
            console.log(`[Bridge] API Response: id=${message.id} status=${message.status}`, message.body);
            pendingRequests.delete(message.id);
            const response = new Response(JSON.stringify(message.body), {
                status: message.status,
                headers: {
                    'Content-Type': 'application/json',
                    ...message.headers,
                },
            });
            pending.resolve(response);
        }
    }
    // Route: Stream Chunk
    else if (message.type === 'STREAM_CHUNK') {
        const stream = activeStreams.get(message.id);
        if (stream) {
            stream.controller.enqueue(new TextEncoder().encode(message.chunk));
        }
    }
    // Route: Stream Close
    else if (message.type === 'STREAM_CLOSE') {
        const stream = activeStreams.get(message.id);
        if (stream) {
            stream.controller.close();
            activeStreams.delete(message.id);
        }
    }
    // Route: Stream Error
    else if (message.type === 'STREAM_ERROR') {
        const stream = activeStreams.get(message.id);
        if (stream) {
            stream.controller.error(new Error(message.error));
            activeStreams.delete(message.id);
        }
    }
    // Route: Encryption Request (Standalone Mode - handle via window.nostr)
    else if (message.type === 'ACTION_ENCRYPT') {
        handleEncryptRequest(message as any);
    }
    // Route: Decryption Request (Standalone Mode)
    else if (message.type === 'ACTION_DECRYPT') {
        handleDecryptRequest(message as any);
    }
    // Route: Sign Request (Standalone Mode)
    else if (message.type === 'ACTION_SIGN_EVENT') {
        handleSignRequest(message as any);
    }
}

/**
 * Handle encryption request from Engine (Standalone Mode only)
 */
async function handleEncryptRequest(message: { id: string; pubkey: string; plaintext: string }): Promise<void> {
    try {
        if (privateKeyBytes) {
            console.log(`[Bridge] Encrypting for ${message.pubkey} (Local Signer)`);
            const conversationKey = nip44.v2.utils.getConversationKey(privateKeyBytes, message.pubkey);
            const ciphertext = nip44.v2.encrypt(message.plaintext, conversationKey);
            console.log(`[Bridge] Encryption success. Ciphertext len: ${ciphertext.length}`);
            postToEngine({ type: 'ENCRYPT_RESULT', id: message.id, ciphertext });
            return;
        }

        const nostr = (window as any).nostr;
        if (!nostr) {
            postToEngine({ type: 'ENCRYPT_RESULT', id: message.id, error: 'No signer available' });
            return;
        }

        let ciphertext: string;
        if (nostr.nip44?.encrypt) {
            ciphertext = await nostr.nip44.encrypt(message.pubkey, message.plaintext);
        } else if (nostr.nip04?.encrypt) {
            ciphertext = await nostr.nip04.encrypt(message.pubkey, message.plaintext);
        } else {
            postToEngine({ type: 'ENCRYPT_RESULT', id: message.id, error: 'Signer does not support encryption' });
            return;
        }

        if (!ciphertext) {
            throw new Error('Signer returned empty ciphertext');
        }

        postToEngine({ type: 'ENCRYPT_RESULT', id: message.id, ciphertext });
    } catch (error) {
        postToEngine({ type: 'ENCRYPT_RESULT', id: message.id, error: error instanceof Error ? error.message : 'Encryption failed' });
    }
}

/**
 * Handle decryption request from Engine (Standalone Mode only)
 */
async function handleDecryptRequest(message: { id: string; pubkey: string; ciphertext: string }): Promise<void> {
    try {
        if (privateKeyBytes) {
            console.log(`[Bridge] Decrypting from ${message.pubkey} (Local Signer). Ctext len: ${message.ciphertext?.length}`);
            if (!message.ciphertext || message.ciphertext.startsWith('{')) {
                console.warn('[Bridge] CRITICAL: Suspicious ciphertext (starts with {). Is it plaintext?');
            }

            const conversationKey = nip44.v2.utils.getConversationKey(privateKeyBytes, message.pubkey);
            const plaintext = nip44.v2.decrypt(message.ciphertext, conversationKey);
            console.log(`[Bridge] Decryption success.`);
            postToEngine({ type: 'DECRYPT_RESULT', id: message.id, plaintext });
            return;
        }

        const nostr = (window as any).nostr;
        if (!nostr) {
            postToEngine({ type: 'DECRYPT_RESULT', id: message.id, error: 'No signer available' });
            return;
        }

        let plaintext: string;
        if (nostr.nip44?.decrypt) {
            plaintext = await nostr.nip44.decrypt(message.pubkey, message.ciphertext);
        } else if (nostr.nip04?.decrypt) {
            plaintext = await nostr.nip04.decrypt(message.pubkey, message.ciphertext);
        } else {
            throw new Error('Signer does not support decryption');
        }

        postToEngine({ type: 'DECRYPT_RESULT', id: message.id, plaintext });
    } catch (error) {
        postToEngine({ type: 'DECRYPT_RESULT', id: message.id, error: error instanceof Error ? error.message : 'Decryption failed' });
    }
}

/**
 * Handle sign request from Engine (Standalone Mode only)
 */
async function handleSignRequest(message: { id: string; event: any }): Promise<void> {
    try {
        if (privateKeyBytes) {
            const signedEvent = finalizeEvent(message.event, privateKeyBytes);
            postToEngine({ type: 'SIGNATURE_RESULT', id: message.id, signedEvent });
            return;
        }

        const nostr = (window as any).nostr;
        if (!nostr) {
            postToEngine({ type: 'SIGNATURE_RESULT', id: message.id, error: 'No signer available' });
            return;
        }

        const signedEvent = await nostr.signEvent(message.event);
        postToEngine({ type: 'SIGNATURE_RESULT', id: message.id, signedEvent });
    } catch (error) {
        postToEngine({ type: 'SIGNATURE_RESULT', id: message.id, error: error instanceof Error ? error.message : 'Signing failed' });
    }
}

/**
 * Send message TO the Engine
 */
export function postToEngine(message: MirageMessage): void {
    if (!enginePort) {
        console.warn('[Bridge] Engine not connected, dropping message:', message.type);
        return;
    }
    // Child Mode: post to parent window
    // Note: We use the isChildMode flag because instanceof Window fails for cross-origin proxies
    if (isChildMode) {
        (enginePort as Window).postMessage(message, '*');
    }
    // Standalone Mode: post to worker
    else {
        (enginePort as Worker).postMessage(message);
    }
}
