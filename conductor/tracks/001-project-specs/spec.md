# Specification: Mirage Project

## 1. Overview
**Mirage** is a client-side platform designed to enable "Text-to-App" generation. It allows AI agents to generate small, "serverless" micro-applications that run entirely within a secure browser sandbox, using **Nostr** as a universal backend for data storage, real-time sync, and identity.

## 2. Core Value Proposition
*   **For Users:** Instant access to secure, private, and collaborative tools without signing up for new SaaS products. Data is owned by the user (stored on Nostr relays).
*   **For AI:** A standardized, reliable "Virtual API" that abstracts away the complexities of cryptography, relay management, and event subscriptions, allowing LLMs to write standard `fetch()` code.

## 3. Architecture
Mirage employs a **Host-Owned Engine** architecture to ensure security and persistence.

### 3.1 Components
1.  **The Host:** The main website (Browser OS). It holds the Nostr connection and keys (via NIP-07). It runs the **Engine** in a Web Worker.
2.  **The Engine:** A headless TypeScript core that translates REST-like requests into Nostr protocol operations (Event publishing, Subscriptions, Encryption).
3.  **The Bridge:** A small library injected into App iframes. It intercepts network requests and routes them to the Host.
4.  **The App:** A sandboxed HTML/JS application (often AI-generated) that believes it is talking to a traditional REST API.

## 4. Functional Specifications

### 4.1 The Virtual API
Apps interact with the system via the `/mirage/v1/` namespace.

*   **Identity:** `GET /user/me` (Profile, Pubkey).
*   **Social:** `GET /feed`, `POST /feed`, `GET /contacts`.
*   **Storage (NIP-78):** Key-Value storage for user preferences. Supports `public=true` for unencrypted metadata.
*   **Spaces (Collaborative):**
    *   **Management:** Create and List encrypted spaces.
    *   **Chat:** Real-time messaging (Kind 42).
    *   **Shared Store:** A "Virtual Database" (Kind 42) with Last-Write-Wins merging for collaborative state (e.g., Todo lists, game state).
*   **Direct Messages:** NIP-17 support for private 1:1 communication.

### 4.2 Security Model
*   **Sandboxing:** Apps run in `iframe` with `sandbox="allow-scripts"`.
*   **Origin Isolation:** Apps have `null` origin and cannot access parent DOM or LocalStorage.
*   **Vault Pattern:** For sensitive data (like passwords), apps perform client-side encryption *before* sending data to the Engine. The Engine/Nostr only ever sees ciphertext.
*   **Permissions:** (Planned) Apps request specific scopes (e.g., `storage_write`, `space_read`).

## 5. Technology Stack
*   **Runtime:** Browser (Client-side only).
*   **Build System:** Bun workspaces.
*   **Languages:** TypeScript.
*   **Protocol:** Nostr (NIP-01, 02, 07, 17, 44, 78).
*   **Libraries:** `nostr-tools`.

## 6. Current Status
*   **Core Engine:** Functional (Worker, Bridge, Fetch Proxy).
*   **Features:** Spaces, Shared Store, and DMs are implemented.
*   **Next Steps:** Building the "Magic Website" (UI for generation) and refining the AI System Prompt.
