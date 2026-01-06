/**
 * Mirage Host - WebAuthn PRF Extension Utilities
 * 
 * Provides secure key derivation using the WebAuthn Pseudo-Random Function (PRF) extension.
 * This allows deriving a stable encryption key from biometric/platform authentication.
 */

/**
 * Checks if the browser supports WebAuthn and the PRF extension.
 * 
 * IMPORTANT: Windows Hello does NOT support PRF extension!
 * You need a hardware security key (YubiKey, etc.) that supports hmac-secret.
 * macOS Touch ID and Chrome on Android DO support PRF.
 */
export async function isPrfSupported(): Promise<boolean> {
    console.log("[WebAuthn PRF] Starting PRF support check...");
    console.warn("[WebAuthn PRF] ⚠️ NOTE: Windows Hello does NOT support PRF. You need a hardware security key (YubiKey) or use macOS/Chrome Android.");

    // 1. Basic WebAuthn support check
    if (!window.PublicKeyCredential) {
        console.warn("[WebAuthn PRF] PublicKeyCredential API not available");
        return false;
    }

    if (!navigator.credentials?.create || !navigator.credentials?.get) {
        console.warn("[WebAuthn PRF] navigator.credentials.create/get not available");
        return false;
    }

    // 2. Secure Context check (required for WebAuthn)
    if (!window.isSecureContext) {
        console.warn("[WebAuthn PRF] Not in a secure context (HTTPS required)");
        return false;
    }
    console.log("[WebAuthn PRF] ✓ Secure context and WebAuthn API available");

    // 3. PRF Extension check via getClientCapabilities (Chrome 128+, Edge 128+)
    try {
        if (typeof window.PublicKeyCredential.getClientCapabilities === 'function') {
            const capabilities = await window.PublicKeyCredential.getClientCapabilities();
            console.log("[WebAuthn PRF] Client capabilities:", JSON.stringify(capabilities, null, 2));

            // Standard key is 'prf', some implementations use 'extension:prf'
            const prfSupported = !!(capabilities as any).prf || !!(capabilities as any)['extension:prf'];
            console.log(`[WebAuthn PRF] PRF via getClientCapabilities: ${prfSupported}`);

            if (!prfSupported) {
                console.warn("[WebAuthn PRF] ⚠️ PRF not supported by current authenticator. If on Windows, Windows Hello doesn't support PRF - use a YubiKey or other security key.");
            }

            return prfSupported;
        } else {
            console.log("[WebAuthn PRF] getClientCapabilities not available, cannot determine PRF support without trying");
        }
    } catch (e) {
        console.warn("[WebAuthn PRF] getClientCapabilities threw:", e);
    }

    // 4. We can't reliably detect PRF support without actually trying
    // Return true but warn that it might fail
    console.warn("[WebAuthn PRF] Cannot detect PRF support. Will attempt registration, but note: Windows Hello does NOT support PRF.");
    return true;
}

/**
 * Options for PRF key derivation
 */
export interface PrfOptions {
    salt?: Uint8Array;
    credentialId?: Uint8Array;
}

// 32-byte fixed salt for the application context
const DEFAULT_SALT = new Uint8Array(32).fill(1);

/**
 * Derives a key using WebAuthn PRF.
 * If credentialId is provided, it performs a 'get' (assertion).
 * If not, it performs a 'create' (attestation), then a 'get' to derive the key.
 */
export async function derivePrfKey(options: PrfOptions = {}): Promise<{ key: Uint8Array, credentialId: Uint8Array }> {
    const salt = options.salt || DEFAULT_SALT;

    // Ensure salt is 32 bytes
    if (salt.length !== 32) {
        throw new Error(`PRF salt must be exactly 32 bytes (got ${salt.length})`);
    }
    console.log("[WebAuthn PRF] Salt (first 8 bytes):", Array.from(salt.slice(0, 8)));

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    console.log("[WebAuthn PRF] Challenge generated (32 bytes)");

    if (options.credentialId) {
        // ---------------------------------------------------------
        // Assertion (Login/Unlock) -> "get"
        // This is where the actual PRF key derivation happens
        // ---------------------------------------------------------
        console.log("[WebAuthn PRF] Starting Assertion (get) with credential ID...");
        console.log("[WebAuthn PRF] Credential ID (base64):", bytesToBase64(options.credentialId));

        // PRF extension requires ArrayBuffer, not Uint8Array
        const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength);

        const prfExtension = {
            prf: {
                eval: {
                    first: saltBuffer  // Must be ArrayBuffer
                }
            }
        };
        console.log("[WebAuthn PRF] PRF extension (eval.first is ArrayBuffer):",
            saltBuffer instanceof ArrayBuffer ? "✓ ArrayBuffer" : "✗ Not ArrayBuffer");

        try {
            const rpId = window.location.hostname;
            console.log(`[WebAuthn PRF] Assertion RP ID: ${rpId}`);

            const publicKeyOptions: PublicKeyCredentialRequestOptions = {
                challenge: challenge.buffer.slice(challenge.byteOffset, challenge.byteOffset + challenge.byteLength) as ArrayBuffer,
                rpId: rpId,  // Required for Google Password Manager on Android
                timeout: 120000,  // 2 minutes
                allowCredentials: [{
                    id: options.credentialId.buffer.slice(
                        options.credentialId.byteOffset,
                        options.credentialId.byteOffset + options.credentialId.byteLength
                    ) as ArrayBuffer,
                    type: 'public-key',
                    transports: ['internal', 'hybrid']  // Platform + sync passkeys
                }],
                userVerification: "required",
                extensions: prfExtension as any
            };

            console.log("[WebAuthn PRF] Calling navigator.credentials.get with extensions...");

            const assertion = await navigator.credentials.get({
                publicKey: publicKeyOptions
            }) as PublicKeyCredential | null;

            if (!assertion) {
                throw new Error("WebAuthn assertion returned null (user canceled?)");
            }

            const results = assertion.getClientExtensionResults();
            console.log("[WebAuthn PRF] Assertion Extension Results:", JSON.stringify(results, null, 2));
            console.log("[WebAuthn PRF] Raw results object keys:", Object.keys(results));

            const prfResult = (results as any).prf || (results as any)['extension:prf'];
            console.log("[WebAuthn PRF] PRF result object:", prfResult);

            if (!prfResult) {
                console.error("[WebAuthn PRF] No PRF in results. Full results:", results);
                throw new Error("WebAuthn PRF: No prf extension in results. Your passkey provider may not support PRF. Google Password Manager has limited PRF support.");
            }

            if (!prfResult.results) {
                throw new Error("WebAuthn PRF: prf.results is missing. Authenticator may not support PRF.");
            }

            if (!prfResult.results.first) {
                throw new Error("WebAuthn PRF: prf.results.first is missing. PRF evaluation failed.");
            }

            const key = new Uint8Array(prfResult.results.first);
            console.log(`[WebAuthn PRF] ✓ Key derived successfully (${key.length} bytes)`);
            return { key, credentialId: new Uint8Array(assertion.rawId) };

        } catch (err: any) {
            console.error("[WebAuthn PRF] Assertion failed:", err);
            if (err.name === 'NotAllowedError') {
                console.error("[WebAuthn PRF] NotAllowedError during assertion - Possible causes:");
                console.error("  1. User canceled or timed out");
                console.error("  2. Credential not found for this RP");
                console.error("  3. Google Password Manager may not support PRF");
            }
            throw err;
        }

    } else {
        // ---------------------------------------------------------
        // Attestation (Register/Setup) -> "create"
        // During creation, we request PRF enablement (empty prf object)
        // The actual key is derived in a follow-up get operation
        // ---------------------------------------------------------
        console.log("[WebAuthn PRF] Starting Attestation (create) to register new credential...");

        const userId = crypto.getRandomValues(new Uint8Array(16));
        const rpId = window.location.hostname;
        console.log("[WebAuthn PRF] Generated user ID for credential");
        console.log(`[WebAuthn PRF] RP ID: ${rpId}`);
        console.log(`[WebAuthn PRF] Full origin: ${window.location.origin}`);

        // PRF extension with eval - derive key during creation
        // This avoids the user gesture expiration issue with follow-up get()
        const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength);

        try {
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: {
                        name: "Mirage",
                        id: rpId
                    },
                    user: {
                        id: userId,
                        name: "mirage-user",
                        displayName: "Mirage User"
                    },
                    pubKeyCredParams: [
                        { alg: -7, type: "public-key" },   // ES256 (ECDSA P-256)
                        { alg: -257, type: "public-key" }  // RS256 (RSASSA-PKCS1-v1_5)
                    ],
                    timeout: 120000,  // 2 minutes - gives mobile users more time
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",  // Use platform authenticator (Touch ID, Windows Hello, etc.)
                        residentKey: "required",
                        userVerification: "required"
                    },
                    // Request PRF AND evaluate it during creation
                    // This avoids needing a follow-up get() which can fail due to user gesture expiration
                    extensions: {
                        prf: {
                            eval: {
                                first: saltBuffer  // Evaluate PRF during create
                            }
                        }
                    } as any
                }
            }) as PublicKeyCredential | null;

            if (!credential) {
                throw new Error("WebAuthn credential creation returned null (user canceled?)");
            }

            const credentialId = new Uint8Array(credential.rawId);
            console.log("[WebAuthn PRF] ✓ Credential created successfully");
            console.log("[WebAuthn PRF] Credential ID (base64):", bytesToBase64(credentialId));

            const results = credential.getClientExtensionResults() as any;
            console.log("[WebAuthn PRF] Attestation Extension Results:", JSON.stringify(results, null, 2));

            const prfResult = results.prf || results['extension:prf'];

            // Check if PRF was evaluated during creation
            if (prfResult) {
                console.log(`[WebAuthn PRF] PRF enabled: ${prfResult.enabled}`);

                // Check if PRF results are available from create()
                if (prfResult.results && prfResult.results.first) {
                    console.log("[WebAuthn PRF] ✓ PRF key derived during creation!");
                    const key = new Uint8Array(prfResult.results.first);
                    console.log(`[WebAuthn PRF] ✓ Key derived successfully (${key.length} bytes)`);
                    return { key, credentialId };
                }

                if (prfResult.enabled === false) {
                    console.error("[WebAuthn PRF] PRF explicitly disabled by authenticator");
                    throw new Error("WebAuthn PRF: Your device created a passkey but does not support PRF encryption. This feature requires a hardware security key or compatible platform authenticator.");
                }
            }

            // PRF wasn't evaluated during create - need follow-up get()
            // This will likely fail on mobile due to user gesture expiration
            console.warn("[WebAuthn PRF] PRF not evaluated during create, attempting follow-up get()...");
            console.warn("[WebAuthn PRF] Note: This may fail on mobile due to user gesture expiration");

            // Try anyway, but this is expected to fail on mobile
            return derivePrfKey({ ...options, credentialId });

        } catch (err: any) {
            console.error("[WebAuthn PRF] Attestation failed:", err);
            // Provide more specific error messages
            if (err.name === 'NotAllowedError') {
                console.error("[WebAuthn PRF] NotAllowedError - Possible causes:");
                console.error("  1. User canceled the operation");
                console.error("  2. User took too long (timeout)");
                console.error("  3. RP ID mismatch with current domain");
                console.error("  4. WebAuthn not triggered by user gesture");
                console.error(`  Current RP ID: ${rpId}`);
            } else if (err.name === 'InvalidStateError') {
                console.error("[WebAuthn PRF] InvalidStateError - Credential already exists for this user");
            } else if (err.name === 'SecurityError') {
                console.error("[WebAuthn PRF] SecurityError - RP ID is not valid for this origin");
            }
            throw err;
        }
    }
}

/**
 * Encrypts data using AES-GCM with a PRF-derived key.
 */
export async function encryptWithPrfKey(key: Uint8Array, plaintext: string): Promise<{ ciphertext: string, iv: string }> {
    console.log(`[WebAuthn PRF] Encrypting ${plaintext.length} characters...`);
    console.log(`[WebAuthn PRF] Key length: ${key.length} bytes`);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    console.log(`[WebAuthn PRF] Generated IV (12 bytes)`);

    try {
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key.buffer as ArrayBuffer,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        console.log("[WebAuthn PRF] ✓ Key imported for encryption");

        const encoded = new TextEncoder().encode(plaintext);
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            encoded
        );

        const result = {
            ciphertext: bytesToBase64(new Uint8Array(encrypted)),
            iv: bytesToBase64(iv)
        };
        console.log(`[WebAuthn PRF] ✓ Encrypted to ${result.ciphertext.length} base64 characters`);
        return result;

    } catch (err) {
        console.error("[WebAuthn PRF] Encryption failed:", err);
        throw err;
    }
}

/**
 * Decrypts data using AES-GCM with a PRF-derived key.
 */
export async function decryptWithPrfKey(key: Uint8Array, ciphertext: string, iv: string): Promise<string> {
    console.log(`[WebAuthn PRF] Decrypting ${ciphertext.length} base64 characters...`);
    console.log(`[WebAuthn PRF] Key length: ${key.length} bytes`);

    try {
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            key.buffer as ArrayBuffer,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        console.log("[WebAuthn PRF] ✓ Key imported for decryption");

        const ivBytes = base64ToBytes(iv);
        const ciphertextBytes = base64ToBytes(ciphertext);
        console.log(`[WebAuthn PRF] IV: ${ivBytes.length} bytes, Ciphertext: ${ciphertextBytes.length} bytes`);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivBytes.buffer as ArrayBuffer },
            cryptoKey,
            ciphertextBytes.buffer as ArrayBuffer
        );

        const result = new TextDecoder().decode(decrypted);
        console.log(`[WebAuthn PRF] ✓ Decrypted to ${result.length} characters`);
        return result;

    } catch (err) {
        console.error("[WebAuthn PRF] Decryption failed:", err);
        throw err;
    }
}

const STORAGE_KEY = 'mirage_identity_v1';

export interface StoredIdentity {
    credentialId: string; // base64
    ciphertext: string;   // base64
    iv: string;           // base64
}

/**
 * Saves the encrypted identity to localStorage.
 */
export function saveIdentity(identity: StoredIdentity): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

/**
 * Loads the encrypted identity from localStorage.
 */
export function loadIdentity(): StoredIdentity | null {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

/**
 * Clears the identity from localStorage.
 */
export function clearIdentity(): void {
    window.localStorage.removeItem(STORAGE_KEY);
}

// Helpers
export function bytesToBase64(bytes: Uint8Array): string {
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
}

export function base64ToBytes(base64: string): Uint8Array {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}