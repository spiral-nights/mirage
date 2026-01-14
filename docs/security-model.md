# Mirage Security Model

This document describes the security architecture of Mirage, designed to protect user data even from malicious apps or other Nostr clients.

## Core Principles

1. **Zero Trust for Apps**: Apps run in sandboxed iframes with `null` origin. They never see private keys.
2. **Encryption by Default**: All private data is encrypted before leaving the browser.
3. **Defense in Depth**: Multiple layers protect user data.

---

## Security Layers

### Layer 1: Iframe Sandbox

```html
<iframe sandbox="allow-scripts allow-forms">
```

- Apps run in a sandboxed iframe with `null` origin
- No access to parent window, localStorage, or cookies
- Cannot make requests to arbitrary origins
- All communication via `postMessage` through the Bridge

### Layer 2: Permission System

Apps declare required permissions in HTML meta tags:

```html
<meta name="mirage-permissions" content="public_read, storage_write">
```

| Permission | Allows |
|------------|--------|
| `public_read` | Read public posts (feed) |
| `public_write` | Publish public posts |
| `storage_read` | Read NIP-78 app data |
| `storage_write` | Write NIP-78 app data |
| `space_read` | Read encrypted space data |
| `space_write` | Write to encrypted spaces |
| `dm_read` | Read NIP-17 direct messages |
| `dm_write` | Send NIP-17 direct messages |

The Host validates permissions via `isPathAllowed()` before forwarding requests to the Engine. Denied requests receive `403 Permission denied`.

**Note**: Admin routes (`/admin/`) are never allowed for apps—no permission grants access to them.

### Layer 5: Administrative Isolation

Mirage uses a **dual-layer access control** system to protect admin operations:

**Layer A: Permission Filtering (Host)**
- The Host validates all API requests from apps via `isPathAllowed()`
- Admin routes (`/mirage/v1/admin/*`) are not in the permission allowlist
- Apps receive `403 Permission denied` before requests reach the Engine

**Layer B: Origin Validation (Engine)**
- Each API request is "stamped" with an `origin` identifying the caller
- The Engine validates that admin routes are called with `origin: "mirage"` (the system origin)
- Regular apps have origins like `kind:pubkey:identifier`, causing admin checks to fail

**Request Stamping Flow:**
```
App Request → Host stamps origin → Engine validates origin → Route Handler
```

- App management routes (`/admin/apps`) use `"mirage"` origin (Host override)
- Space operations use the current app's origin (data remains app-scoped)

This ensures that a malicious app cannot rename your spaces, delete other apps, or access system-level configuration even if it manages to bypass other security layers.

### Layer 3: NIP-07 Signing

Apps **never** have access to private keys:

```
App → API Request → Engine → Host → NIP-07 Signer (browser extension)
```

- All signing happens outside the sandbox
- User confirms sensitive operations via their signer extension
- Private keys remain in the browser extension

### Layer 4: Data Encryption

**All app-specific data is encrypted at rest on relays.**

| Data Type | Encryption Method |
|-----------|-------------------|
| Storage | NIP-44 self-encryption (user encrypts to own pubkey) |
| Channels | Symmetric key (ChaCha20), key delivered via NIP-17 |
| DMs | NIP-17 sealed messages |

#### Why Encryption Matters

Without encryption, any Nostr client could:
- Query relays for your NIP-78 storage events
- Read your app data in plaintext
- Correlate your app usage across apps

With encryption:
- Data is unreadable without the decryption key
- Only the user (or authorized group members) can decrypt
- Other apps/clients see only ciphertext

---

## Attack Scenarios & Mitigations

### Scenario 1: Malicious App

**Attack**: App tries to steal user data or impersonate actions.

**Mitigations**:
- Sandboxed iframe prevents DOM access to parent
- NIP-07 signer prompts for sensitive operations
- Permissions limit what APIs the app can access

### Scenario 2: Malicious Relay

**Attack**: Relay returns fake events or censors content.

**Mitigations**:
- Multiple relay redundancy (default: 2+ relays)
- Event signatures verified (NIP-01)
- Sensitive data encrypted (relay sees ciphertext only)

### Scenario 3: Rogue Nostr Client

**Attack**: Another Nostr client queries your storage events.

**Mitigations**:
- Storage content is NIP-44 encrypted
- Without the decryption key, data is unreadable
- Keys stay in the user's NIP-07 signer

### Scenario 4: Man-in-the-Middle

**Attack**: Attacker intercepts WebSocket traffic.

**Mitigations**:
- `wss://` (TLS) required for relay connections
- Event signatures ensure integrity
- NIP-44 encryption ensures confidentiality

---

## Encryption Flow

### Storage Write (PUT)

```
1. App calls: fetch('/mirage/v1/storage/key', { method: 'PUT', body: data })
2. Engine receives request
3. Engine → Host: ACTION_ENCRYPT { pubkey: self, plaintext: data }
4. Host → NIP-07 Signer: nip44.encrypt(self, data)
5. Signer returns ciphertext
6. Engine publishes Kind 30078 event with encrypted content
```

### Storage Read (GET)

```
1. App calls: fetch('/mirage/v1/storage/key')
2. Engine queries relay for Kind 30078 events
3. Engine → Host: ACTION_DECRYPT { pubkey: self, ciphertext }
4. Host → NIP-07 Signer: nip44.decrypt(self, ciphertext)
5. Signer returns plaintext
6. Engine returns decrypted data to app
```

---

## Recommendations

1. **Use a Trusted NIP-07 Signer**: Alby, nos2x, or similar browser extensions
2. **Use Multiple Relays**: Don't rely on a single relay
3. **Review App Permissions**: Only grant permissions the app needs
4. **Keep Signer Updated**: Security patches are important
