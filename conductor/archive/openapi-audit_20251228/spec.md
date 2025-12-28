# Specification: Audit and Update OpenAPI Specification

## 1. Overview
The current OpenAPI specification (`docs/openapi.yaml`) is missing definitions for recently implemented API routes (e.g., `/api/v1/user/me`). This track aims to synchronize the documentation with the actual implementation by auditing the codebase and updating the YAML file.

## 2. Scope
-   **Target File:** `docs/openapi.yaml`
-   **Source of Truth:** `packages/core/src/engine/routes/*.ts`

## 3. Functional Requirements

### 3.1 Route Audit
-   Identify all registered routes in `packages/core/src/engine/index.ts` and route modules:
    -   `user.ts`
    -   `spaces.ts`
    -   `dm.ts`
    -   `contacts.ts`
    -   `events.ts`
    -   `apps.ts`
    -   `storage.ts`

### 3.2 Specification Updates
-   **Add Missing Paths:** Create path definitions for any routes found in the code but missing in the spec.
    -   Specifically confirm: `/mirage/v1/user/me` (Note: Implementation uses `/mirage/v1` prefix, check if spec uses `/api` or `/mirage`).
-   **Verify Schemas:** Ensure request bodies and response objects match the TypeScript interfaces defined in `@mirage/core`.

## 4. Technical Considerations
-   The build process copies `docs/openapi.yaml` to `packages/web/src/assets/openapi.yaml`. No manual update to the web package file is needed, but a build/copy might be required to verify.
-   Ensure consistent naming conventions (e.g., `camelCase` vs `snake_case`) matching the code.

## 5. Out of Scope
-   Automatic generation of OpenAPI spec (this is a manual update task).
