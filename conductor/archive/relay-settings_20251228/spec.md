# Specification: Relay Settings Page

## 1. Overview
Implement a Relay Settings page in Mirage Studio to manage relay connections. The management logic is strictly a Host/Client concern and is isolated from the sandboxed App API.

## 2. Functional Requirements

### 2.1 Curated Relay List
-   **List:** 10 popular Nostr relays hardcoded in the frontend.
-   **Default State:** Only `wss://relay.damus.io` is enabled.
-   **Persistence:** Selection is stored in `localStorage`.

### 2.2 Relay Management UI
-   **Route:** `/settings`.
-   **Display:** List of 10 relays with:
    -   URL.
    -   Status dot (Green: Connected, Yellow: Connecting, Red: Error).
    -   Toggle switch to enable/disable.
-   **Actions:**
    -   Enabling a relay immediately calls `host.addRelay()`.
    -   Disabling a relay immediately calls `host.removeRelay()`.

### 2.3 System Control Logic (Internal)
-   **Status Tracking:** The `RelayPool` in `@mirage/core` will track connection states for active relays.
-   **Internal Messaging:**
    -   New message type: `ACTION_GET_RELAY_STATUS`.
    -   The Engine handles this message by returning the current pool stats.
    -   The Host class provides `getRelayStats()` to expose this data to the Studio UI.

## 3. Technical Considerations
-   **Security:** Relay management endpoints/messages are NOT exposed via the standard API requested by apps. They are internal control messages between Host and Engine.
-   **Polling:** The Settings page will poll the status every few seconds while visible.

## 4. Out of Scope
-   Adding custom user-defined relays.
-   NIP-65 Relay List syncing.
-   Latency (ms) display.
