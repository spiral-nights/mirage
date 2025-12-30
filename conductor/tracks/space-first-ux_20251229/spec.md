# Specification: Space-First UX Implementation

## Overview
This track implements the "Space-First" model for Mirage, shifting the paradigm from apps creating data silos to users creating "Spaces" (named instances) of applications. This matches user expectations from tools like Notion or Obsidian, where data ownership is explicit and intuitive.

## User Stories
- As a user, I want to create named "Spaces" (e.g., "Work Journal") to organize my data.
- As a user, I want to launch an app within a chosen Space to ensure data isolation.
- As a user, I want to share a Space with others for collaborative data access.
- As a user, I want to see which Space an app is currently running in and have the ability to switch.
- As a developer, I want my app to receive its Space context automatically via the Mirage API.

## Functional Requirements

### 1. Engine & API (@mirage/core)
- **New Endpoint:** `GET /mirage/v1/space` returns metadata about the currently injected space context (id, name, owner, members) or `{ "id": null, "standalone": true }`.
- **Space Resolution:** 
    - Support the `current` keyword in space-scoped endpoints (e.g., `/mirage/v1/spaces/current/store/:key`).
    - If no space context is injected, `current` resolves to a persistent per-app "Default" space.
    - Document the `current` resolution and the new endpoint in `docs/openapi.yaml`.
- **Message Handling:** The Engine must handle a new `SET_SPACE_CONTEXT` message from the Host to establish the active space before app execution.

### 2. Host (@mirage/host)
- **Mount Configuration:** Update `MirageHost.mount()` to accept optional `spaceId` and `spaceName` parameters.
- **Context Injection:** Send `SET_SPACE_CONTEXT` to the Engine and Bridge (for preview mocking) immediately after establishing the app origin.
- **Space Management API:** Expose `createSpace`, `listSpaces`, `getSpace`, `deleteSpace`, and `inviteToSpace` methods on `MirageHost` for use by the Mirage Web UI.

### 3. Web UI (@mirage/web)
- **Sidebar:** Add a "Spaces" section listing the user's created spaces.
- **Space Creation Flow:**
    - User names the space.
    - User selects an App from their library to associate with the space (Strict 1:1 binding).
- **Space Listing/Management:**
    - Each app in the Library should indicate how many spaces (instances) it has.
    - Support custom icons/colors for Spaces to aid visual distinction.
- **Run Experience:** 
    - Show a space indicator/switcher in the header when an app is running.
    - Handle "Standalone" mode: If an app is launched without a space, provide a temporary, non-persistent "Session" space.
- **App Publishing:** Update the Publish Modal to allow developers to declare if an app requires a space, optimally uses one, or is strictly standalone.

### 4. Developer Experience & Testing
- **System Prompt:** Update the Mirage AI system prompt to reflect the space-first model, discouraging internal space creation and encouraging the use of `GET /mirage/v1/space`.
- **Preview Mocking:** Ensure all new Space endpoints (especially `GET /space` and `SET_SPACE_CONTEXT`) are fully supported in the `preview-mock` bridge, allowing apps to be tested in the studio editor with simulated space contexts.

## Acceptance Criteria
- Users can create multiple "Spaces" for the same App, and each space has isolated data.
- The `GET /mirage/v1/space` endpoint returns correct metadata within a running app.
- An app can use `/spaces/current/store` without knowing its own space ID.
- Launching an app from the "Spaces" sidebar section immediately opens the correct app with the correct data context.
- Sharing a Space results in the recipient seeing the space in their list and being able to open it with the same app.
- Preview mode correctly simulates a Space environment for testing.

## Out of Scope
- Multi-app spaces (Multiple apps accessing the same space data).
- Automated space data migration from the old model (Users must manually move data if needed).
