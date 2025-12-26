# Workflow: Mirage Development

## Development Process
We follow a specification-driven development approach managed by the Conductor framework.

1.  **Specification:** Every track begins with a `spec.md` defining requirements and acceptance criteria.
2.  **Planning:** An implementation `plan.md` is created, broken down into verifiable phases.
3.  **Implementation:** Features are built iteratively.
4.  **Verification:** Each phase is verified using unit/integration tests and manual checks.

## Testing Strategy
- **Unit Tests:** `bun test` for core logic and React components.
- **Manual Verification:** Running the app in the browser to confirm UX and real-world behavior.

## Phase Completion Verification Protocol
To ensure high quality, every phase in a plan MUST conclude with a verification task:
- `- [ ] Task: Conductor - User Manual Verification '<Phase Name>' (Protocol in workflow.md)`

The verification involves:
1.  Running all relevant automated tests.
2.  Checking for TypeScript errors and linting issues.
3.  Confirming that the functionality matches the `spec.md`.
