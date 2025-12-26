# Plan: Real Networking & Persistence

## Phase 1: Core Networking (Engine & Host)
- [ ] Task: Implement `fetchApp(naddr)` in `@mirage/core`
    - [ ] Add `ACTION_FETCH_APP` message type.
    - [ ] Implement Engine logic to query relays for Kind 30078 by `d` tag (parsed from `naddr`).
    - [ ] Return the decrypted (or cleartext) content.
- [ ] Task: Implement Space Key Generation in `@mirage/core`
    - [ ] Ensure `crypto.ts` uses **XChaCha20-Poly1305** for symmetric key generation.
    - [ ] Expose `createSpace()` method to the Bridge.
- [ ] Task: Connect `publishApp` to Real Relays
    - [ ] Update `useMirage.tsx` to send the signed event to the Engine's publish queue properly.
    - [ ] Add confirmation listener for "OK" messages.
- [ ] Task: Conductor - User Manual Verification 'Core Networking' (Protocol in workflow.md)

## Phase 2: Runtime & Deep Linking
- [ ] Task: Update `RunPage` for Real Data
    - [ ] Implement `naddr` parsing in `useMirage`.
    - [ ] Replace mock fetch with `host.fetchApp(naddr)`.
    - [ ] Build the "Skeleton Loader" UI (shimmer effect).
- [ ] Task: Implement URL Hash Parsing
    - [ ] Parse `#space=<id>&key=<key>` in `RunPage`.
    - [ ] Inject these credentials into the Engine's session memory.
- [ ] Task: Implement "Share" Button
    - [ ] Add button to Immersive Dock.
    - [ ] Logic: Serialize current App + Space Key into a shareable URL.
- [ ] Task: Conductor - User Manual Verification 'Runtime & Deep Linking' (Protocol in workflow.md)

## Phase 3: Persistence (NIP-78 Sync)
- [ ] Task: Implement NIP-78 Sync Logic
    - [ ] Create `AppLibrary` class in `@mirage/core`.
    - [ ] Implement `syncApps()`: Manage `mirage:app_list`.
    - [ ] Implement `syncKeys()`: Manage `mirage:space_keys` (Self-Encrypted Keychain).
- [ ] Task: Update "My Apps" Page
    - [ ] Switch from `localStorage` to `AppLibrary` (NIP-78).
    - [ ] Add "Installed Spaces" section (apps you joined but didn't create).
- [ ] Task: Conductor - User Manual Verification 'Persistence' (Protocol in workflow.md)
