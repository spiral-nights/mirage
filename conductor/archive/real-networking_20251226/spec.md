# Specification: Real Networking & Persistence

## 1. Overview
Transition the Mirage from a mocked state to a fully functional, Nostr-connected application. This track implements real event broadcasting, standard NIP-19 addressing, and cross-device persistence for the user's app collection.

## 2. Functional Requirements

### 2.1 Addressing & Sharing
- **Standard Identifiers:** Adopt NIP-19 `naddr` strings for all app references.
- **URL Routing:** Update the Run Page to handle `/run/:naddr`.
- **Easy Sharing:** Add a "Share" button to the Immersive Dock that generates a deep link containing the App Address (`naddr`) and, if applicable, the active Space ID and Key (`#space=id&key=abc`).

### 2.2 Robust Publishing
- **Network Broadcast:** Connect `publishApp` to the Engine's relay pool to broadcast Kind 30078 events.
- **Confirmation Flow:** Implement a listener for the Engine's "OK" (Event Published) acknowledgment.
- **Error Handling:** Display a user-friendly error notification in the Mirage UI if the signature or broadcast fails.

### 2.3 Real Fetching & Runtime
- **On-Demand Fetching:** Replace hardcoded dummy HTML with a real lookup. The Engine will query configured relays for the latest Kind 30078 matching the `naddr`.
- **Skeleton Loading:** Implement a skeleton preview UI for the `RunPage` to provide immediate visual feedback while the network request is in flight.
- **Space Generation:** If no space is provided, the Engine must generate a new random Space ID and Symmetric Key upon app initialization.
- **Space Injection:** Automatically detect and inject Space IDs and Keys provided via URL hash.
- **Space Permissions:** Implement a permission prompt when an app requests access to a space that was not explicitly provided in the URL.

### 2.4 Profile Sync (My Library)
- **NIP-78 App List:** Create and maintain a private, self-encrypted NIP-78 event (d-tag: `mirage:app_list`) to store the user's collection of published apps.
- **NIP-78 Keychain:** Create and maintain a private, self-encrypted NIP-78 event (d-tag: `mirage:space_keys`) to store symmetric keys for spaces the user has joined.
- **UI Update:** Update "My Apps" page to display both "Authored Apps" and "Shared Spaces" (Installed Apps).

## 3. Non-Functional Requirements
- **Cryptography:** Use **XChaCha20-Poly1305** for all symmetric space encryption (NIP-44 compliant or project standard).
- **Security:** Ensure that Space Keys received via URL are upgraded to the user's secure keychain (NIP-78) only after user confirmation or authentication.
- **Performance:** App code should be cached locally (IndexedDB) after the first fetch to ensure instant loads on subsequent visits.

## 4. Acceptance Criteria
- [ ] Users can publish a real HTML file and receive a shareable `naddr` link.
- [ ] Navigating to an `naddr` link correctly fetches and runs the app code from Nostr relays.
- [ ] Apps published on one device appear in the "My Apps" list on another device.
- [ ] Users can generate a "Share Link" that includes the encryption key for a collaborative space.
- [ ] Users can see a list of shared spaces they have joined (but not authored).
