# Plan: Real Networking & Persistence

## Phase 1: Core Networking (Engine & Host)
- [x] Task: Implement `fetchApp(naddr)` in `@mirage/core`
    - [x] Add `ACTION_FETCH_APP` message type.
    - [x] Implement Engine logic to query relays for Kind 30078 by `d` tag (parsed from `naddr`).
    - [x] Return the decrypted (or cleartext) content.
- [x] Task: Implement Space Key Generation in `@mirage/core`
    - [x] Ensure `crypto.ts` uses **XChaCha20-Poly1305** for symmetric key generation.
    - [x] Expose `createSpace()` method to the Bridge.
- [x] Task: Connect `publishApp` to Real Relays
    - [x] Update `useMirage.tsx` to send the signed event to the Engine's publish queue properly.
    - [x] Add confirmation listener for "OK" messages.
- [x] Task: Conductor - User Manual Verification 'Core Networking' (Protocol in workflow.md)

## Phase 2: Runtime & Deep Linking
- [x] Task: Update `RunPage` for Real Data
    - [x] Implement `naddr` parsing in `useMirage`.
    - [x] Replace mock fetch with `host.fetchApp(naddr)`.
    - [x] Build the "Skeleton Loader" UI (shimmer effect).
- [x] Task: Implement URL Hash Parsing
    - [x] Parse `#space=<id>&key=<key>` in `RunPage`.
    - [x] Inject these credentials into the Engine's session memory.
- [x] Task: Implement "Share" Button
    - [x] Add button to Immersive Dock.
    - [x] Logic: Serialize current App + Space Key into a shareable URL.
- [x] Task: Conductor - User Manual Verification 'Runtime & Deep Linking' (Protocol in workflow.md)

## Phase 3: Persistence (NIP-78 Sync)
- [x] Task: Implement NIP-78 Sync Logic
    - [x] Create `AppLibrary` class in `@mirage/core`.
    - [x] Implement `syncApps()`: Manage `mirage:app_list`.
    - [x] Implement `syncKeys()`: Manage `mirage:space_keys` (Self-Encrypted Keychain).
- [x] Task: Update "My Apps" Page
    - [x] Switch from `localStorage` to `AppLibrary` (NIP-78).
    - [x] Add "Installed Spaces" section (apps you joined but didn't create).
- [x] Task: Conductor - User Manual Verification 'Persistence' (Protocol in workflow.md)
