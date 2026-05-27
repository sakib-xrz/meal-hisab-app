# Meal Hisab UI Redesign — Task Tracker

## Phase 0 — Dependencies

- [x] Install `@gorhom/bottom-sheet`
- [x] Install `expo-linear-gradient`
- [x] Install `expo-blur`

## Phase 1 — Design System

- [x] Update `global.css` (new tokens, glassmorphism utilities)
- [x] Update `constants/theme.ts` (new Brand colors, shadows)

## Phase 2 — Animated Splash Screen

- [x] Rewrite `splash-screen.tsx` with Reanimated animations

## Phase 3 — UI Components (23 components)

- [x] `shimmer.tsx` [NEW] — skeleton loading
- [x] `bottom-sheet-modal.tsx` [NEW] — branded confirmation sheets
- [x] `animated-view.tsx` [NEW] — FadeIn, StaggerList, ScalePress
- [x] `card.tsx` — glass/elevated variants
- [x] `button.tsx` — scale interaction, gradient, rounded-xl
- [x] `input.tsx` — animated focus, rounded-xl, left icon
- [x] `avatar.tsx` — gradient ring, status dot
- [x] `badge.tsx` — pill shape, icon support
- [x] `metric-tile.tsx` — glass variant, animated counter
- [x] `action-row.tsx` — scale press, gradient icon
- [x] `meal-stepper.tsx` — spring toggle, haptics
- [x] `segment-control.tsx` — animated sliding indicator
- [x] `empty-state.tsx` — floating icon animation
- [x] `error-state.tsx` — shake animation
- [x] `toast-config.tsx` — glassmorphic, icons
- [x] `app-header.tsx` — glass background, gradient shadow
- [x] `brand-mark.tsx` — gradient icon bg
- [x] `brand-hero.tsx` — LinearGradient bg
- [x] `screen.tsx` — greeting header, branded refresh
- [x] `list-row.tsx` — scale press
- [x] `section-header.tsx` — accent line
- [x] `stat-row.tsx` — gradient highlight
- [x] `label.tsx` — letter-spacing refinement

## Phase 4 — Screens Redesign

- [x] `login.tsx` — gradient bg, glass card, stagger animation
- [x] `register.tsx` — gradient bg, glass card
- [x] `create-mess.tsx` — gradient hero, glass card
- [x] `index.tsx` (Dashboard) — greeting, animated metrics, skeletons
- [x] `meals.tsx` — skeletons, bottom sheet, glass date picker
- [x] `members.tsx` — skeletons, bottom sheet, stagger
- [x] `settings.tsx` — glass profile, bottom sheets, animated sections
- [x] `meals/summary.tsx` — skeletons, stagger
- [x] `meals/history.tsx` — skeletons, bottom sheet
- [x] `meals/[id].tsx` — glass card, bottom sheet
- [x] `members/add.tsx` — glass card, stagger
- [x] `members/[id].tsx` — glass card, bottom sheet
- [x] `settings/transfer-ownership.tsx` — glass warning, bottom sheet

## Phase 5 — Glassmorphism Tab Bar

- [x] Rewrite `(tabs)/_layout.tsx` with custom glass tab bar
- [x] Update root `_layout.tsx` with BottomSheet/Gesture providers

## Phase 6 — Polish & Verification

- [x] Run app and verify no crashes
- [x] Test all screens and interactions
- [x] Create walkthrough
