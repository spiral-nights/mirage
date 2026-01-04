# Plan: Space-First UX Implementation

## Phase 1: Core Engine & API Updates
- [ ] Task: Update OpenAPI Specification
    - [ ] Sub-task: Add `GET /mirage/v1/space` to `docs/openapi.yaml`.
    - [ ] Sub-task: Document `current` ID resolution behavior in `docs/openapi.yaml`.
- [ ] Task: Implement Space Context in Engine
    - [ ] Sub-task: TDD - Create tests for `GET /space` and `current` resolution in `packages/core`.
    - [ ] Sub-task: Implement `SET_SPACE_CONTEXT` message handler in `Engine`.
    - [ ] Sub-task: Implement `GET /mirage/v1/space` handler in `routes/spaces.ts`.
    - [ ] Sub-task: Update `getSpaceStore` and `getSpaceMessages` to resolve `current` keyword.
- [ ] Task: Implement Fallback Logic
    - [ ] Sub-task: Implement "Default" space resolution for standalone apps (no context injected).
- [ ] Task: Update Bridge for Preview
    - [ ] Sub-task: Update `packages/core/src/bridge/preview-mock.ts` to handle `GET /space` requests.
    - [ ] Sub-task: Update `packages/core/src/bridge/index.ts` to forward `SET_SPACE_CONTEXT` messages.
- [ ] Task: Conductor - User Manual Verification 'Core Engine & API Updates' (Protocol in workflow.md)

## Phase 2: Host & Web Logic Integration
- [ ] Task: Update Mirage Host
    - [ ] Sub-task: Update `MirageHost.mount` signature to accept `spaceId`/`name`.
    - [ ] Sub-task: Implement `postMessage` logic to send space context to worker and iframe.
    - [ ] Sub-task: Implement `createSpace`, `listSpaces`, `getSpace` on `MirageHost` class.
- [ ] Task: Web Hooks & State
    - [ ] Sub-task: Create `useSpaces` hook in `@mirage/web` to manage space list fetching/subscriptions.
    - [ ] Sub-task: Update `useMirage` to support launching with space context.
- [ ] Task: Conductor - User Manual Verification 'Host & Web Logic Integration' (Protocol in workflow.md)

## Phase 3: UI Implementation
- [ ] Task: Sidebar Updates
    - [ ] Sub-task: Create `SidebarSpaces` component.
    - [ ] Sub-task: Implement list rendering with icons/colors.
- [ ] Task: Space Creation Flow
    - [ ] Sub-task: Create `CreateSpaceModal` component.
    - [ ] Sub-task: Implement App selection logic (filter library by installed apps).
    - [ ] Sub-task: Connect creation flow to `host.createSpace`.
- [ ] Task: Run Page Updates
    - [ ] Sub-task: Update `RunPage` to read space context from URL/state.
    - [ ] Sub-task: Implement "Space Switcher/Indicator" in the app header.
- [ ] Task: App Publishing Updates
    - [ ] Sub-task: Add "Space Requirements" dropdown to `PublishModal`.
    - [ ] Sub-task: Save requirement metadata to app manifest.
- [ ] Task: Conductor - User Manual Verification 'UI Implementation' (Protocol in workflow.md)

## Phase 4: Developer Experience & Cleanup
- [ ] Task: System Prompt Update
    - [ ] Sub-task: Update `packages/web/src/lib/system-prompt.ts` with new Space-First guidelines.
- [ ] Task: Integration Testing
    - [ ] Sub-task: Verify `preview-mock` works in the Mirage UI with space context.
    - [ ] Sub-task: Verify standalone app behavior (Default space fallback).
- [ ] Task: Conductor - User Manual Verification 'Developer Experience & Cleanup' (Protocol in workflow.md)
