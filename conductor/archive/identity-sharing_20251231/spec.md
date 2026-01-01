# Specification: Identity-Based Sharing (NIP-17)

## Overview
This track implements a secure, identity-based sharing mechanism for encrypted Spaces using NIP-17 Gift Wraps. This replaces the insecure "Link Sharing" model where encryption keys were passed via URL fragments. In this new model, encryption keys are transmitted exclusively over the Nostr network, wrapped in multiple layers of encryption, and tied to specific user pubkeys.

## Functional Requirements

### 1. Invitation Flow (Sender)
- **Invite Modal:** A new `InviteModal` component will be created to facilitate sharing.
    - **Input:** Supports NPUB and hex pubkeys.
    - **Validation:** Real-time validation of input format.
    - **Profile Lookup:** Automatically fetches and displays the recipient's profile (name and picture) if the pubkey is valid to confirm identity before sending.
    - **Convenience:** Includes a "Paste from Clipboard" button.
- **Action:** Triggers the Engine's `POST /mirage/v1/spaces/:id/invite` endpoint.
- **Feedback:** The "Send" button will show a loading spinner during the publish process, followed by a success toast notification.

### 2. Auto-Acceptance Flow (Recipient)
- **Background Sync:** The Mirage Engine will automatically poll for Kind 1059 (Gift Wrap) events containing Kind 13 rumors with the `mirage_invite` type.
- **Keychain Integration:** Valid invites are automatically decrypted, and the symmetric key is saved to the recipient's NIP-78 keychain (`d="mirage:space_keys"`).
- **User Awareness:** When a new space is successfully added to the keychain via an invite, a temporary toast notification will appear (e.g., "New space 'Grocery List' added").

### 3. UI Integration
- **Sidebar Update:** The existing "Share" action in the sidebar will be renamed/replaced with "Invite".
- **Removal of Legacy Sharing:** The "Copy Link" functionality (which previously included or was intended to include keys) is removed entirely to prevent accidental insecure sharing.
- **App Actions:** `AppActionsContext` will be updated to support the `onInvite` action.

## Non-Functional Requirements
- **Privacy:** Invitations must use Kind 13 rumors inside Kind 1059 Gift Wraps to ensure they do not appear in standard Nostr DM/chat inboxes.
- **Security:** Raw encryption keys must never touch the URL bar or browser history.
- **Performance:** Profile lookup and invitation publishing should be handled asynchronously to maintain UI responsiveness.

## Acceptance Criteria
- Alice can invite Bob to a space using his npub.
- Alice sees the recipient's profile details in the modal before confirming.
- Bob receives a toast notification when he is invited to a space.
- The shared space appears in Bob's space list automatically after the invite is processed.
- No "Copy Link" or key-in-URL functionality remains in the UI.

## Out of Scope
- Revocation of invites (to be addressed in a future track).
- Management of "Pending" invites (invites are auto-accepted in this phase).
