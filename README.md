# 🏜️ Mirage: The Nostr App Engine

> **Build serverless, decentralized apps using nothing but HTML, JavaScript, and an AI prompt.**

Mirage is a runtime environment that allows "micro-apps" to run entirely on the Nostr network. It abstracts the complexity of relays, cryptography, and NIPs into a **Virtual REST API**.

This allows developers (and AI agents) to build feature-rich social and data apps using standard `fetch()` calls, unaware that the "backend" is actually a decentralized protocol running inside a Web Worker.

## ⚡ Key Features

* **The Virtual API:** A standardized REST surface (`/mirage/v1/feed`, `/mirage/v1/storage`) that automatically translates HTTP requests into Nostr events.
* **True Serverless:** Apps are stored as Nostr events (Kind 30xxx) and run locally. No AWS, no Vercel, no backend maintenance.
* **AI-Native Design:** The API is designed to be "self-documenting" for LLMs. You can prompt an AI: *"Make a grocery list app using the Mirage API"* and it will work instantly.
* **Zero-Knowledge Security:** Apps run in a sandboxed `iframe` with a `null` origin. They **never** touch the user's private keys.
* **Family-Ready:** Built-in support for NIP-29 Groups and NIP-17 Encryption allows for private, shared apps (e.g., "Family Chores" or "Team Notes").

## 🏗️ Architecture

Mirage uses a **Fetch Proxy** architecture to bridge the secure sandbox and the Nostr network.

```mermaid
graph TD
    subgraph "Parent Host (Your Site)"
        A[User Interface]
        B[NIP-07 Signer (Alby/Keys)]
    end

    subgraph "Sandboxed Environment"
        direction TB
        C[User App (HTML/JS)]
        D[Bridge Library]
        E[Mirage Engine (Web Worker)]
    end

    C -- "fetch('/api/feed')" --> D
    D -- "postMessage()" --> E
    E -- "WebSockets" --> F((Nostr Relays))
    
    %% Security Boundary
    E -. "Request Signature" .-> A
    A -. "Approved Signature" .-> E

```

1. **The App:** Standard HTML/JS. It thinks it's talking to a server.
2. **The Bridge:** Intercepts `window.fetch` requests and routes them to the Worker.
3. **The Engine:** The Web Worker that holds the state, manages relay connections, and formats data into NIP-compliant events.

## 📖 The Virtual API

Apps built on Mirage interact with these virtual endpoints:

### Public & Social

| Endpoint | Method | Description |
| --- | --- | --- |
| `/mirage/v1/user/me` | `GET` | Get current user profile (Kind 0) |
| `/mirage/v1/users/:pubkey` | `GET` | Get user by public key |
| `/mirage/v1/feed` | `GET/POST` | Read or post to the public timeline (Kind 1) |

### Storage & State (NIP-78)

| Endpoint | Method | Description |
| --- | --- | --- |
| `/mirage/v1/storage/:key` | `GET` | Retrieve stored value |
| `/mirage/v1/storage/:key` | `PUT` | Store or update value |
| `/mirage/v1/storage/:key` | `DELETE` | Delete stored value |

### Private & Groups (Encrypted)

| Endpoint | Method | Description |
| --- | --- | --- |
| `/mirage/v1/groups` | `GET` | List private groups (NIP-29) |
| `/mirage/v1/groups/:id/storage` | `PUT` | Shared group state (Grocery lists, Kanban) |
| `/mirage/v1/dm/:pubkey` | `POST` | Private encrypted messaging (NIP-17) |

### Storage API Example

```javascript
// Save user preferences
await fetch('/mirage/v1/storage/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ theme: 'dark', fontSize: 16 })
});

// Load preferences
const response = await fetch('/mirage/v1/storage/preferences');
const { value } = await response.json();
console.log(value.theme); // 'dark'

// Delete preferences
await fetch('/mirage/v1/storage/preferences', { method: 'DELETE' });
```

## 🛡️ Security Model

Mirage implements a strict **"Air Gap"** between the app logic and user secrets.

1. **Iframe Sandbox:** Apps are loaded via `srcdoc` with `sandbox="allow-scripts"`. They cannot access cookies, local storage, or the parent DOM.
2. **Permission Manifest:** Apps must declare intent via meta tags:
```html
<meta name="mirage-permissions" content="public_read, storage_read, storage_write">
```

```


3. **User Consent:** When an app tries to sign an event, the Parent Host receives the request and can prompt the user for approval. The private key never enters the iframe.

## 🧩 Supported NIPs

| NIP | Feature | Usage in Mirage |
| --- | --- | --- |
| **01** | Basic Protocol | Events, Metadata, Text Notes |
| **07** | Browser Signer | Delegating key operations to extensions |
| **17** | Private DMs | Encrypted messaging and app sharing |
| **29** | Groups | Private/Shared state for family apps |
| **51** | Lists | Sets of items (bookmarks, shopping lists) |
| **78** | App Data | Arbitrary JSON storage for apps |
| **96** | HTTP File Upload | Storing images/media for apps |

## 🚀 Getting Started

### Installation

```bash
npm install @mirage/engine

```

### Usage (Host Implementation)

```javascript
import { MirageHost } from '@mirage/engine';

// 1. Initialize the Host
const host = new MirageHost({
  signer: window.nostr, 
  relays: ['wss://relay.damus.io', 'wss://groups.nostr.com']
});

// 2. Load an App (from a Nostr Event)
const appEvent = await host.fetchApp('naddr1...');

// 3. Mount the App into an iframe
host.mount(appEvent, document.getElementById('app-container'));

```

## 🗺️ Roadmap

* [x] **Phase 1: Core Engine** ✅ (Fetch Proxy, Web Worker, NIP-01/07)
* [x] **Phase 2: Persistence Layer** ✅ (NIP-78 Storage with full test coverage)
* [ ] **Phase 3: Privacy Layer** (NIP-17 Encryption, NIP-29 Groups)
* [ ] **Phase 4: The AI Prompt** (Standardized system prompt for app generation)

## 📄 License

MIT

