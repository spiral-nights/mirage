# Plan: Mirage Studio (The Website)

## Goal
Build a beautiful, functional web interface for prompting, publishing, and running Mirage micro-apps.

## Proposed Stack
- **Framework:** React + Vite (TypeScript)
- **Styling:** Tailwind CSS + Headless UI
- **Engine:** Integrated `@mirage/host` and `@mirage/core`

## Visual & UX Strategy
- **Minimalist "Vibe Coding" Aesthetic:** Dark mode, glassmorphism, and neon accents.
- **Workflow:**
    1.  **"The Prompt" Page:** A dedicated page displaying the Mirage System Prompt & API Spec for the user to copy.
    2.  **"The Publisher" Page:** A text area to paste the AI-generated HTML.
        -   **Action:** Publishes the code as a Kind 30078 Nostr event.
        -   **Result:** Redirects to the "Run" page.
    3.  **"The Stage" (Run Page):**
        -   Loads the app from the Kind 30078 event.
        -   Runs it in the sandboxed iframe.
        -   Handles URL-based Space Key injection (for sharing).

## Implementation Tasks
- [ ] **Phase 1: Setup**
    - [ ] Initialize `packages/web` with Vite/React.
    - [ ] Configure Tailwind CSS and shared workspace dependencies.
- [ ] **Phase 2: The Pages**
    - [ ] **Prompt Page:** Create a "Copy to Clipboard" UI for the System Spec.
    - [ ] **Publish Page:** Create the "Paste HTML" editor and publishing logic (Kind 30078).
    - [ ] **Run Page:** Implement the `naddr` loader and the iframe container.
- [ ] **Phase 3: Integration**
    - [ ] Integrate `@mirage/host` for NIP-07 Login.
    - [ ] Implement the "Link-to-Keychain" upgrade flow (saving shared keys to NIP-78).
