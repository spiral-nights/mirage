# Tech Stack: Mirage

## Core
- **Build System:** Bun (Workspaces)
- **Language:** TypeScript
- **Protocol:** Nostr (NIP-01, NIP-07, NIP-17, NIP-44, NIP-78)
- **Cryptography:** `nostr-tools`, `@noble/ciphers`

## Packages
- **@mirage/core:** Headless engine logic, relay pool, and bridge implementation.
- **@mirage/host:** Parent window controller for sandboxing and NIP-07 signing.
- **@mirage/web:** React-based "Mirage Studio" UI.

## Web Studio (@mirage/web)
- **Framework:** React 19
- **Bundler:** Vite
- **Styling:** Tailwind CSS (Vivid Pop Theme)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Testing:** Bun Test + Happy DOM + React Testing Library
