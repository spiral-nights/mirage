# Plan: WebAuthn-Secured Login Flow

## Phase 1: Identity & NIP-07 Polyfill
Establish the core logic for handling secret keys and making them available via the standard NIP-07 interface.

- [ ] Task: Implementation - Create `auth.ts` utility for `nsec` generation, validation, and NIP-07 polyfill logic.
- [ ] Task: Implementation - Create a `LocalSigner` class that implements the NIP-07 interface using a provided `nsec`.
- [ ] Task: Implementation - Add logic to "inject" the `LocalSigner` into `window.nostr`.
- [ ] Task: Verification - Unit tests for `auth.ts` and `LocalSigner` (key generation, signing accuracy).
- [ ] Task: Conductor - User Manual Verification 'Identity & NIP-07 Polyfill' (Protocol in workflow.md)

## Phase 2: WebAuthn PRF Logic
Implement secure storage using the WebAuthn PRF extension to derive encryption keys from biometric/OS-level authentication.

- [ ] Task: Research/Utility - Implement PRF support detection and key derivation helpers.
- [ ] Task: Implementation - Encryption/Decryption logic using the PRF-derived key (AES-GCM).
- [ ] Task: Implementation - Persistence layer to save/load encrypted `nsec` from `localStorage`.
- [ ] Task: Verification - Unit tests for encryption/decryption flow (mocking WebAuthn API).
- [ ] Task: Conductor - User Manual Verification 'WebAuthn PRF Logic' (Protocol in workflow.md)

## Phase 3: Login UI Component
Build the interactive elements for the login flow.

- [ ] Task: UI - Create `LoginModal.tsx` using existing design patterns (Tailwind + Framer Motion).
- [ ] Task: Implementation - Handle multiple states: "Landing", "Manual Entry", "Generated Key", "Unlock with Biometrics".
- [ ] Task: Implementation - Integration with `window.nostr` detection to show "Sign in with Extension".
- [ ] Task: Verification - Component tests for `LoginModal` (state transitions, input validation).
- [ ] Task: Conductor - User Manual Verification 'Login UI Component' (Protocol in workflow.md)

## Phase 4: Global Integration
Connect the login flow to the main application lifecycle.

- [ ] Task: State - Create `useAuth` hook or update `MirageProvider` to manage global authentication state.
- [ ] Task: Logic - Update `MirageProvider` to automatically trigger the `LoginModal` if no identity is active.
- [ ] Task: Logic - Ensure `MirageHost` is re-initialized correctly when a new signer is provided.
- [ ] Task: Verification - End-to-end manual verification of the full flow (Login -> Reload -> Unlock).
- [ ] Task: Conductor - User Manual Verification 'Global Integration' (Protocol in workflow.md)
