# Product: Mirage App Engine

## Vision
Mirage is a client-side "operating system" for decentralized, ephemeral applications. It enables "Text-to-App" workflows where AI can generate fully functional, collaborative apps that run entirely in the browser, powered by Nostr for identity, storage, and real-time synchronization.

## Target Audience
- **Vibe Coders:** Users who want to build custom tools using natural language prompts.
- **Privacy-Conscious Users:** People who want to use software without centralized backends or data silos.
- **AI Agents:** LLMs that need a standardized "Virtual API" to build and execute user-requested logic.

## Key Features
- **Virtual API:** Translates standard `fetch()` calls into Nostr events (Kind 30078, 42, 17, etc.).
- **Sandboxed Execution:** Apps run in secure `null-origin` iframes.
- **Space-First UX:** A "Notion-like" model where users create named Spaces (instances) of apps, ensuring clear data ownership and easy sharing.
- **Mirage:** A web interface for prompting LLMs, publishing app code to Nostr, managing personal app collections, and configuring network relays.
- **Secure Sharing:** Identity-based sharing of encrypted spaces using NIP-17 Gift Wraps, ensuring keys never leak via URLs.
- **Background Synchronization:** A persistent Engine Worker manages relay connections and background tasks (like fetching invites) even when apps are idle.
