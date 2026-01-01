# Plan: Identity-Based Sharing (NIP-17)

## Phase 1: Backend Verification & Cleanup
- [ ] Task: Review `packages/core/src/engine/routes/spaces.ts` to ensure `syncInvites` and `inviteMember` are correctly implemented.
- [ ] Task: Ensure `syncInvites` is called within the `listSpaces` route handler to trigger auto-discovery.
- [ ] Task: Remove any legacy "Key Sharing" endpoints (like `getSpaceKey`) or privileged actions (like `ACTION_EXPORT_SPACE_KEY`) from the Engine.
- [ ] Task: Write/Verify unit tests for `inviteMember` in `packages/core/tests/spaces.test.ts` (mocking the pool).
- [ ] Task: Conductor - User Manual Verification 'Backend Verification & Cleanup' (Protocol in workflow.md)

## Phase 2: Frontend Component: InviteModal
- [ ] Task: Create `packages/web/src/components/InviteModal.tsx`.
- [ ] Task: Implement pubkey validation (NPUB/Hex) and "Paste from Clipboard" functionality.
- [ ] Task: Implement profile lookup logic to fetch and display the recipient's name and picture for confirmation.
- [ ] Task: Implement the "Send Invite" logic (calling the Engine API) with a loading spinner state.
- [ ] Task: Write unit tests for `InviteModal.tsx` (checking validation, rendering, and action firing) in `packages/web/tests/InviteModal.test.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Frontend Component: InviteModal' (Protocol in workflow.md)

## Phase 3: UI Integration & Logic
- [ ] Task: Update `AppActionsContext.tsx` to include `onInvite` in the action set.
- [ ] Task: Modify `Sidebar.tsx` to replace the "Share" action with "Invite" and link it to the `onInvite` callback.
- [ ] Task: Update `RunPage.tsx` to implement the `onInvite` handler (opening the modal) and remove legacy "Copy Link" code.
- [ ] Task: Update `PreviewPage.tsx` and other relevant pages to remove or update the "Share" action.
- [ ] Task: Update existing component tests (Sidebar, RunPage) to reflect the action change.
- [ ] Task: Conductor - User Manual Verification 'UI Integration & Logic' (Protocol in workflow.md)

## Phase 4: Recipient Experience & Notifications
- [ ] Task: Implement a global notification mechanism (or update existing ones) to show a toast when a new space is added to the keychain via NIP-17.
- [ ] Task: Verify that `syncInvites` correctly merges keys into the NIP-78 keychain and persists them.
- [ ] Task: Perform a full end-to-end test: Alice (Author) invites Bob (Guest), Bob receives the toast and the space appears in his library.
- [ ] Task: Conductor - User Manual Verification 'Recipient Experience & Notifications' (Protocol in workflow.md)
