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
- [x] **Phase 1: Setup**
    - [x] Initialize `packages/web` with Vite/React.
    - [x] Configure Tailwind CSS and shared workspace dependencies.
- [x] **Phase 2: The Pages**
    - [ ] **Prompt Page:** Create a "Copy to Clipboard" UI for the System Spec.
        - [ ] Create `system-prompt.ts` with embedded OpenAPI spec.
        - [ ] Add user input field for custom app description.
    - [x] **Publish Page:** Create the "Paste HTML" editor and publishing logic (Kind 30078).
    - [x] **Run Page:** Implement the `naddr` loader and the iframe container.
- [x] **Phase 3: Integration**
    - [x] Integrate `@mirage/host` for NIP-07 Login.
    - [ ] Implement the "Link-to-Keychain" upgrade flow (saving shared keys to NIP-78).
