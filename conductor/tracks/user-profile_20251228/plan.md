# Plan: User Profile Header Component

## Goal
Implement a persistent, interactive user profile component for identity display and account management.

## Implementation Tasks

### Phase 1: Data & Component Foundation
- [ ] **Create UserProfile Component Skeleton**
    - [ ] Create `packages/web/src/components/UserProfile.tsx`.
    - [ ] Define basic props and Tailwind structure for glassmorphism.
- [ ] **Implement Profile Fetching Logic**
    - [ ] Use `useMirage` to access `pool` and `pubkey`.
    - [ ] Implement `useEffect` to fetch/subscribe to Kind 0 metadata.
    - [ ] Map NIP-01 fields (`name`, `display_name`, `picture`) to local state.
- [ ] **Implement Fallback/Loading States**
    - [ ] Create a placeholder avatar (e.g., using `User` icon from `lucide-react` or a generated SVG).
    - [ ] Add skeleton loading state for the name and avatar.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Data & Component Foundation' (Protocol in workflow.md)

### Phase 2: Layout & Mobile Header Updates
- [ ] **Update RootLayout for Mobile Header**
    - [ ] Modify the mobile header in `packages/web/src/layouts/RootLayout.tsx`.
    - [ ] Center the "Mirage" logo using absolute positioning or flex-1/3 layout.
    - [ ] Add the `UserProfile` component to the top-right.
- [ ] **Position UserProfile on Desktop**
    - [ ] Add `UserProfile` to the top-right of the main content area in `RootLayout`.
    - [ ] Ensure it remains visible during scroll or is fixed/absolute as appropriate.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Layout & Mobile Header Updates' (Protocol in workflow.md)

### Phase 3: Dropdown & Interactions
- [ ] **Implement Dropdown Menu**
    - [ ] Build a dropdown containing "Settings" and "Logout" options.
    - [ ] Use `framer-motion` for entry/exit animations (consistent with app style).
- [ ] **Implement Actions**
    - [ ] **Settings:** Use `useNavigate` to go to `/settings`.
    - [ ] **Logout:** Implement a `logout` function in `useMirage` (or local) to clear the signer and redirect.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Dropdown & Interactions' (Protocol in workflow.md)

### Phase 4: Final Polish & Testing
- [ ] **Styling Pass**
    - [ ] Ensure the component matches the dark mode glassmorphism theme.
    - [ ] Verify hover and active states for menu items.
- [ ] **Verify Responsiveness**
    - [ ] Test on multiple viewport sizes (mobile, tablet, desktop).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Polish & Testing' (Protocol in workflow.md)
