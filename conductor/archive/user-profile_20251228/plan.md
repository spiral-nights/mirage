# Plan: User Profile Header Component

## Goal
Implement a persistent, interactive user profile component for identity display and account management.

## Implementation Tasks

### Phase 1: Data & Component Foundation
- [x] **Create UserProfile Component Skeleton**
    - [x] Create `packages/web/src/components/UserProfile.tsx`.
    - [x] Define basic props and Tailwind structure for glassmorphism.
- [x] **Implement Profile Fetching Logic**
    - [x] Use `useMirage` to access `pool` and `pubkey`.
    - [x] Implement `useEffect` to fetch/subscribe to Kind 0 metadata.
    - [x] Map NIP-01 fields (`name`, `display_name`, `picture`) to local state.
- [x] **Implement Fallback/Loading States**
    - [x] Create a placeholder avatar (e.g., using `User` icon from `lucide-react` or a generated SVG).
    - [x] Add skeleton loading state for the name and avatar.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Data & Component Foundation' (Protocol in workflow.md)

### Phase 2: Layout & Mobile Header Updates
- [x] **Update RootLayout for Mobile Header**
    - [x] Modify the mobile header in `packages/web/src/layouts/RootLayout.tsx`.
    - [x] Center the "Mirage" logo using absolute positioning or flex-1/3 layout.
    - [x] Add the `UserProfile` component to the top-right.
- [x] **Position UserProfile on Desktop**
    - [x] Add `UserProfile` to the top-right of the main content area in `RootLayout`.
    - [x] Ensure it remains visible during scroll or is fixed/absolute as appropriate.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Layout & Mobile Header Updates' (Protocol in workflow.md)

### Phase 3: Dropdown & Interactions
- [x] **Implement Dropdown Menu**
    - [x] Build a dropdown containing "Settings" and "Logout" options.
    - [x] Use `framer-motion` for entry/exit animations (consistent with app style).
- [x] **Implement Actions**
    - [x] **Settings:** Use `useNavigate` to go to `/settings`.
    - [x] **Logout:** Implement a `logout` function in `useMirage` (or local) to clear the signer and redirect.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Dropdown & Interactions' (Protocol in workflow.md)

### Phase 4: Final Polish & Testing
- [x] **Styling Pass**
    - [x] Ensure the component matches the dark mode glassmorphism theme.
    - [x] Verify hover and active states for menu items.
- [x] **Verify Responsiveness**
    - [x] Test on multiple viewport sizes (mobile, tablet, desktop).
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Polish & Testing' (Protocol in workflow.md)