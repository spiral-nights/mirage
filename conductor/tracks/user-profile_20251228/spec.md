# Specification: User Profile Header Component

## 1. Overview
Implement a persistent user profile component located in the top-right corner of the application interface. This component displays the currently logged-in user's profile information (sourced from Nostr Kind 0 events) and provides a dropdown menu for quick actions.

## 2. Functional Requirements

### 2.1 Profile Data Source
- **Primary Source:** Subscribe to and display data from the user's NIP-01 Metadata event (Kind 0).
- **Fields:**
    -   **Avatar:** Display `picture` URL. Fallback to a default identifying icon/color if missing or failed load.
    -   **Name:** Display `display_name`, `name`, or shortened public key (npub) in that order of preference.

### 2.2 UI/UX
- **Desktop:**
    -   Placement: Top-right corner of the main content area.
    -   Visuals: Avatar + Name + Chevron.
- **Mobile:**
    -   Placement: Top-right corner of the fixed mobile header.
    -   Layout Change:
        -   Hamburger Menu: Top-Left (existing).
        -   Mirage Logo: **Centered**.
        -   Profile Icon: Top-Right (Avatar only, no text).
- **Loading State:** Show a skeleton or loading spinner while metadata is fetching.

### 2.3 Interactions
- **Click:** Toggles a dropdown menu.
- **Dropdown Items:**
    1.  **Settings:** Navigates to `/settings` route.
    2.  **Logout:** Executes logout logic (clears session) and redirects to `/create` or home.

## 3. Technical Considerations
- **Component Structure:** Create `packages/web/src/components/UserProfile.tsx`.
- **Layout Updates:** Modify `RootLayout.tsx` to handle the new mobile header layout (3-column grid or flex-between with absolute center).
- **State Management:** Use `useMirage` hook to access current user pubkey and signer.
- **Data Fetching:** Use `pool.get()` or `pool.subscribe()` (via core engine) to fetch Kind 0.
- **Styling:** Tailwind CSS, matching the existing "glassmorphism" aesthetic.
- **Icons:** Use `lucide-react` for fallback avatar, chevron, settings, and logout icons.

## 4. Out of Scope
- Implementation of the full Settings page content (placeholder exists).
- Editing profile metadata (read-only for this track).
