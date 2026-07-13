@AGENTS.md

# Portfolio RN App — working guide

A personal portfolio built as a **React Native mobile app** (not a website). Three-act
arc: **Entry** (Clerk auth as designed onboarding) → **Portfolio** (animation-heavy
showcase) → **Exit** (Stripe "buy me a coffee"). Full rationale + phase specs live in
[`PLAN.md`](PLAN.md).

## Session protocol
- **One phase = one session.** Start by reading `PLAN.md`, check its **Progress** section
  for handoff state, do the phase, then update Progress before closing.
- This is Expo **SDK 54** (pinned to match the Expo Go app published on the Play Store /
  App Store — SDK 57 exists but Expo Go doesn't support it yet, so device testing would
  break). Consult versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing
  integration code.
- **Git:** work on feature branches (`feature/<phase-or-topic>`), never commit straight to
  `main`. Open a PR (or at least merge deliberately) per phase.

## ⭐ The Premium Bar (standing acceptance criterion, every phase)
The whole app must read as premium — enforced per-phase, never deferred to "polish."
- **Type:** no system fonts, ever. Clash Display (display) + Satoshi (body), loaded via
  `expo-font`. Use the scale in `theme.type`, never raw sizes.
- **Colour:** cinematic warm near-black; ONE amber/gold accent used sparingly as *light*,
  not fill. Elevation via warm surface tints + hairlines, not shadows. Tokens in `theme.colors`.
- **Motion:** one shared vocabulary in `src/theme/theme.ts` — `easing`, `duration`
  (250/400/600), `spring`. Never `Easing.ease`; never an un-choreographed move. 60fps
  on-device is mandatory (animate on the UI thread — shared values + `useAnimatedStyle`).
- **Micro-interactions:** pressed states + haptics (`@/lib/haptics`) on every interactive
  element, added in the phase that builds the element.

## Stack (locked)
- **Expo SDK 54**, Expo Router (typed routes), **New Architecture** (default).
- **Reanimated 4.1** + `react-native-worklets` (babel plugin auto-configured by
  `babel-preset-expo` — there is no `babel.config.js`, and none is needed).
- **Moti** for declarative entrance/stagger animation (verified working on Reanimated 4).
- `react-native-gesture-handler` (root is wrapped in `GestureHandlerRootView`).
- Auth = **Clerk** (`@clerk/expo` — Clerk's Core 3 package rename from `@clerk/clerk-expo`,
  see PLAN.md Phase 2 handoff). Payments = **Stripe** test mode (Phase 6,
  requires a dev build — pipeline pre-validated via EAS in Phase 1).
- **Dark-locked.** No light mode. `userInterfaceStyle: "dark"`.

## Conventions
- Path alias `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- Routes: `/` = entry, `/style-tile`, `/portfolio`, `/exit`. Route groups `(entry)`,
  `(portfolio)`, `(exit)` organise the acts; groups add **no** URL segment, so screens
  inside are named distinctly (never two `index` files → they'd both be `/`).
- **Import `theme` from `@/theme/theme` for all tokens.** Never hardcode a colour, size,
  duration, or font family in a component.
- Text only through `@/components/Text` (`<Text variant=… color=…>`). Buttons through
  `@/components/Button`. Screen chrome through `@/components/Screen`.

## Project layout
```
src/
  app/            expo-router routes (the three acts + style-tile)
  components/     Text · Button · Screen · AccentOrb
  content/        projects.ts — real portfolio data (some copy still DRAFT)
  lib/            haptics.ts
  theme/          theme.ts (art-direction spec) · fonts.ts
assets/fonts/     Clash Display + Satoshi .otf (Fontshare, commercial-free)
eas.json          development / preview / production build profiles
```

## Run / build
- Dev (Phases 1–5): `npm start` → Expo Go on an Android device (scan QR).
- EAS Android build (pipeline validation / distribution): `eas build -p android --profile preview`
  (needs `eas login` first). Dev-client build waits until Phase 6.
