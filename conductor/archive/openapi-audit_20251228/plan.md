# Plan: Audit and Update OpenAPI Specification

## Goal
Synchronize the OpenAPI specification with the implemented Mirage Engine API routes.

## Implementation Tasks

### Phase 1: Audit & Comparison
- [x] **Analyze Core Engine Router**
    - [x] Review `packages/core/src/engine/index.ts` `matchRoute` function.
    - [x] Map all paths and methods to a checklist.
- [x] **Review Route Handlers**
    - [x] Inspect each module in `packages/core/src/engine/routes/`.
    - [x] Extract parameter types and return types (body schemas).
- [x] **Compare with existing `docs/openapi.yaml`**
    - [x] Identify missing endpoints.
    - [x] Identify discrepancies in schemas or parameter names.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Audit & Comparison' (Protocol in workflow.md)

### Phase 2: Specification Updates
- [x] **Update `docs/openapi.yaml` - User Routes**
    - [x] Add `GET /mirage/v1/user/me`.
    - [x] Add `GET /mirage/v1/users/{pubkey}` and `/mirage/v1/profiles/{pubkey}`.
- [x] **Update `docs/openapi.yaml` - Other Routes**
    - [x] Update Spaces, DMs, Contacts, Storage as identified in audit.
- [x] **Update Shared Schemas**
    - [x] Update `components/schemas` to match `packages/core/src/types.ts`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Specification Updates' (Protocol in workflow.md)

### Phase 3: Validation & Sync
- [x] **Validate YAML Syntax**
    - [x] Ensure the file is valid OpenAPI (check for indentation errors, etc.).
- [x] **Sync Assets**
    - [x] Run `bun run --filter @mirage/web copy-artifacts` to propagate the changes.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Validation & Sync' (Protocol in workflow.md)