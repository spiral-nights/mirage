# Spec: WebAuthn-Secured Login Flow

## Overview
Implement a comprehensive login system for Mirage that prioritizes NIP-07 extensions while providing a secure, local-first alternative for users without extensions. This includes a reusable login modal that supports identity generation, manual `nsec` entry, and secure persistence using the WebAuthn PRF (Pseudo-Random Function) extension.

## Functional Requirements
- **Extension Integration:** If `window.nostr` is detected, show a "Sign in with Extension" button in the login modal to provide a clear entry point.
- **Manual Identity Management:**
    - Support manual entry of a Nostr secret key (`nsec`).
    - Support generating a brand-new Nostr identity directly within the UI.
- **NIP-07 Polyfill:** If the user logs in manually (new/existing `nsec` or WebAuthn decryption), the application must create and inject a `window.nostr` object that implements the NIP-07 specification (getPublicKey, signEvent, nip04, nip44).
- **Secure Persistence (WebAuthn PRF):**
    - If the WebAuthn PRF extension is available, allow users to encrypt and save their `nsec` to `localStorage`.
    - Provide an "Unlock with Biometrics" button for returning users to trigger decryption.
- **Graceful Fallback:** If WebAuthn PRF is unsupported by the browser, the application will keep the identity in memory only (Session Only), requiring re-entry on reload.
- **UI/UX:**
    - Implementation of a dedicated Login Modal (triggered automatically if no identity is found).
    - Clear UI states for "Logged Out", "Locked (needs biometrics)", and "Logged In".

## Non-Functional Requirements
- **Security:** `nsec` must never be stored in plaintext. Encryption must utilize the PRF-derived key.
- **Privacy:** Local storage usage should be minimal and focused purely on the encrypted identity.

## Acceptance Criteria
- [ ] Application successfully detects `window.nostr` and displays the "Sign in with Extension" option.
- [ ] User can generate a new `nsec` and enter the app.
- [ ] User can enter an existing `nsec` and enter the app.
- [ ] Manual login successfully injects a NIP-07 compliant `window.nostr` object.
- [ ] On browsers supporting PRF, `nsec` is encrypted and saved; returning users can unlock it via biometric prompt.
- [ ] On browsers without PRF support, the app functions in "Session Only" mode without errors.
- [ ] The login modal appears automatically if no valid session/identity exists.

## Out of Scope
- Password-based local encryption.
- Multi-account switching in the initial release.
- Read-only/Watch mode using `npub`.
