# Plan: Relay Settings Page

## Goal
Implement a settings page for managing relay connections with status indicators, keeping relay control isolated to the Host environment.

## Implementation Tasks

### Phase 1: Engine Internal Updates
- [x] **Update RelayPool**
    - [x] Modify `packages/core/src/engine/relay-pool.ts` to track connection status (`connected`, `connecting`, `disconnected`, `error`).
    - [x] Add `getStats()` method to `RelayPool`.
- [x] **Add Internal Message Handler**
    - [x] Update `packages/core/src/types.ts` to include `ACTION_GET_RELAY_STATUS` and `RELAY_STATUS_RESULT` messages.
    - [x] Update `packages/core/src/engine/index.ts` to handle `ACTION_GET_RELAY_STATUS`.
- [x] **Add Unit Tests (Core)**
    - [x] Update `packages/core/tests/relay-pool.test.ts` to verify status tracking.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Engine Internal Updates' (Protocol in workflow.md)

### Phase 2: Host & Frontend Logic
- [x] **Update MirageHost**
    - [x] Add `getRelayStats()` method to `MirageHost`.
- [x] **Implement Persistence & State in Web**
    - [x] Create `packages/web/src/lib/relays.ts` with the curated list of 10 relays.
    - [x] Update `useMirage` to manage `localStorage` and relay initialization.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Host & Frontend Logic' (Protocol in workflow.md)

### Phase 3: Settings UI & Testing
- [x] **Create Settings Page**
    - [x] Create `packages/web/src/pages/SettingsPage.tsx`.
    - [x] Render the relay list with Toggles and Status Indicators.
- [x] **Wire up Route**
    - [x] Update `packages/web/src/App.tsx` to render `SettingsPage`.
- [x] **Add Unit Tests (Web)**
    - [x] Create `packages/web/tests/SettingsPage.test.tsx` to verify UI behavior.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Settings UI & Testing' (Protocol in workflow.md)