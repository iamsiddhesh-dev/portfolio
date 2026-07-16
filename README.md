# Portfolio — a React Native app, not a website

A personal portfolio built as a real Expo/React Native mobile app, structured as a three-act
arc: **Entry** (real Clerk auth, doubling as a designed "who are you and why are you here?"
onboarding) → **Portfolio** (animation-heavy showcase of projects and patterns) → **Exit** (a
real Stripe "buy me a coffee" tip flow, test mode). The pitch: instead of a static resume site,
this *is* the demo — auth, payments, and 60fps custom motion, built and shipped end to end.

<!-- GIF: hero.gif — the full arc, ~10s: entry sign-up → portfolio hero greeting the visitor by name → scroll into the reel -->

## Stack

- **Expo SDK 54**, Expo Router (typed routes), React Native's New Architecture
- **Reanimated 4.1** + `react-native-worklets` — all animation runs on the UI thread
- **Moti** for declarative entrance/stagger animation
- **Clerk** (`@clerk/expo`) for auth, with `unsafeMetadata` capturing visitor type + reason
  during onboarding, later read back by the portfolio hero
- **Stripe** (`@stripe/stripe-react-native`, test mode) for the exit-act tip flow, backed by a
  small serverless PaymentIntent endpoint (see `server/`)
- **Dark-locked** — cinematic warm near-black palette, one amber accent, Clash Display +
  Satoshi type, no system fonts anywhere

Full art-direction spec and phase-by-phase build log: [`PLAN.md`](PLAN.md). Working conventions
for this repo: [`CLAUDE.md`](CLAUDE.md).

## Running it

Most of the app (Entry + Portfolio acts) runs in plain **Expo Go** — only the Exit act's Stripe
PaymentSheet needs a **dev client** build, since it's a real native module.

```bash
npm install
cp .env.example .env.local   # fill in Clerk + Stripe publishable keys, see below
npm start                    # scan the QR code with Expo Go
```

To reach the Exit act (Stripe tip flow), you need:

1. A deployed instance of `server/` (its own tiny Vercel project — see `server/.env.example`)
   with `EXPO_PUBLIC_API_BASE_URL` in `.env.local` pointed at it.
2. A dev-client build instead of Expo Go, since `@stripe/stripe-react-native` is a native module:
   ```bash
   npx eas-cli build -p android --profile development
   npx expo start --dev-client
   ```

`.env.example` documents every required key (Clerk publishable key, Stripe test publishable
key, server base URL).

## Architecture notes

- **Route groups** `(entry)` / `(portfolio)` / `(exit)` organize the three acts; groups add no
  URL segment, so screens inside are named distinctly rather than colliding on `index`.
- **One design-token file.** `src/theme/theme.ts` is the single source of colour, type, spacing,
  and the motion vocabulary (`easing` / `duration` / `spring` presets, reused everywhere —
  nothing hand-rolls its own curve or duration).
- **Reduce-motion is a first-class concern**, not an afterthought: `src/lib/useReducedMotion.ts`
  wraps the OS accessibility setting, and the largest/most decorative motion (hero parallax,
  onboarding step transitions, the card deck's spring feel, the tip-success particle burst, the
  project detail morph) all gate behind it — durations collapse toward instant and bouncy
  springs swap for near-critically-damped ones, while functional feedback (haptics, success
  copy) stays intact either way.
- **Client ↔ server split for payments is deliberate and total.** The app never sees
  `STRIPE_SECRET_KEY` — it POSTs a preset tip amount to `server/api/create-payment-intent.ts`
  (its own Vercel project) and gets back a `clientSecret`. The endpoint has no auth by design;
  a hardcoded allow-list of the three tip amounts is its entire abuse-mitigation story.

## Animation patterns

Each of these is a from-scratch technique, not a library component — one line each on how it
works, with a GIF placeholder to fill in from an on-device recording.

**Reverse-scroll reel** (`src/components/portfolio/ReverseScrollSection.tsx`) — a pinned overlay
above the scroll content whose cards animate in reverse-order as you scroll past a runway
spacer, driven entirely by one shared `scrollY` value with zero React re-renders per frame.

<!-- GIF: reverse-scroll-reel.gif — scrolling past the hero into the pinned reel, cards animating in -->

**Momentum scroll section** (`src/components/portfolio/MomentumScrollSection.tsx`) — a long,
smooth-scrolling journey section where even the stat count-up is driven via
`useAnimatedProps` on a `TextInput`, so the number ticks up with no React state at all.

<!-- GIF: momentum-scroll.gif — scrolling through the section, stat counters ticking up -->

**Card → detail morph** (`src/lib/morph.tsx`, `src/app/(portfolio)/project/[id].tsx`) — a manual
FLIP-technique shared-element transition: a plain colour frame scales from the tapped card's
measured rect to fill the screen while content crossfades from the mini card into the real
detail header, landing on a pixel-identical real screen underneath.

<!-- GIF: card-morph.gif — tapping a project card, watching it expand into the detail screen -->

**Gesture-physics card deck** (`src/components/portfolio/CardDeck.tsx`) — genuinely custom
gesture-driven physics (not scroll-linked): drag rotates the top card, release either springs it
back or, past a distance/velocity threshold, flings it off-screen and cycles it to the bottom of
an infinite deck.

<!-- GIF: card-deck.gif — swiping through a few cards in both directions -->

**Stripe tip → celebration** (`src/app/(exit)/exit.tsx`, `src/components/exit/Celebration.tsx`)
— preset tip amounts feed a real Stripe `PaymentSheet` (test mode); on success, a UI-thread
particle burst plus the app's recurring "light source" orb motif arrive with a bouncy spring,
then hand off to a sign-off screen.

<!-- GIF: stripe-celebration.gif — tapping a tip amount, completing the test-card PaymentSheet, the celebration burst -->

## Demo video

A 60–90s screen recording of the full arc, for viewers who can't install the APK (iOS-only
devices, recruiters skimming quickly). Suggested shot list:

| # | Screen / action | ~Seconds |
|---|---|---|
| 1 | Entry: sign-up credentials → visitor-type step → reason step | 12s |
| 2 | Verify step (code entry) → land in Portfolio | 6s |
| 3 | Hero greeting the visitor by their chosen type + reason, scroll cue | 6s |
| 4 | Scroll into the reverse-scroll reel, a few cards passing | 10s |
| 5 | Continue scroll through the momentum section, stat count-up | 10s |
| 6 | Tap a project card → morph into detail screen → back | 10s |
| 7 | Card deck: swipe 2–3 cards | 8s |
| 8 | To the exit → pick a tip amount → PaymentSheet with a test card | 12s |
| 9 | Celebration burst → sign-off screen | 6s |

<!-- VIDEO: demo.mp4 — record per the shot list above, then link/embed it here -->

## Build

EAS Android preview build (internal-distribution APK — the link that goes in applications):

```bash
npx eas-cli login
npx eas-cli build -p android --profile preview
```

**Preview build share link:** https://expo.dev/accounts/bhoot-is-here/projects/Portfolio/builds/810fa0c9-b6d4-4dd4-901c-0d39ec3eabec

## Known limitations

- Test-mode Stripe only; no live-mode keys, no Apple/Google Pay, no webhooks/receipts.
- iOS distribution isn't set up — Android APK + demo video cover non-Android viewers.
- On-device performance profiling and the GIF/video captures above are a manual, on-device
  follow-up (see `PLAN.md` Progress section for the current state).
