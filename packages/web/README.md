# Mirage (@mirage/web)

The official web interface for the Mirage App Engine. This is where users "vibe code"—generating apps via AI and publishing them to Nostr—and where they run those apps in a secure, sandboxed environment.

## 🚀 Getting Started

### Prerequisites
*   **Bun** (v1.0+)
*   **NIP-07 Extension** (Alby, nos2x) for signing events.

### Installation

This package is part of the Mirage monorepo. From the root:

```bash
bun install
```

### Development Server

Start the Vite development server:

```bash
bun run --filter @mirage/web dev
```

The app will be available at `http://localhost:5173`.

> **Note:** The Mirage website relies on the `@mirage/host` engine. In development, the engine worker and bridge scripts must be served correctly. The default setup assumes `engine-worker.js` and `bridge.js` are available in the public path.

## 🧪 Testing

We use `bun test` with `happy-dom` to simulate a browser environment.

```bash
# Run tests once
bun test

# Run tests in watch mode
bun test --watch
```

**Test Setup:**
Tests run with a custom preload script (`tests/setup.ts`) that mocks:
*   `Worker` (The Mirage Engine)
*   `window.nostr` (NIP-07 Signer)
*   `crypto` and other browser APIs.

## 🏗 Architecture

*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS (Theme: "Vivid Pop") + Framer Motion
*   **State:** React Context (`useMirage`) manages the Engine connection.
*   **Engine Integration:** Uses `@mirage/host` to spawn the Web Worker that handles all Nostr communication.

### Key Directories
*   `src/components`: Reusable UI elements (Sidebar, Modals).
*   `src/pages`: Main views (Home, Run, Settings).
*   `src/hooks`: Custom hooks (`useMirage`).
*   `tests`: Unit and integration tests.

## 📦 Building for Production

```bash
bun run --filter @mirage/web build
```

This generates a static site in `dist/`. Ensure that the `engine-worker.js` and `bridge.js` artifacts from `@mirage/core` are copied to the build output directory before deployment.
