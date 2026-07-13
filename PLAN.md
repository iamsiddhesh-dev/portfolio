# Portfolio RN App — Phased Execution Plan

> **How to use this file:** one phase = one Claude Code session. Start each session with:
> *"Read PLAN.md. We're on Phase N. Check the Progress section for handoff state, then begin."*
> At the end of every session, update the **Progress** section at the bottom before closing.

---

## Why this project exists

A personal portfolio built as a **React Native mobile app** (not a website), serving three goals:

1. **Job hunting** — Frontend Engineer application at YoLearn.ai (their form explicitly asks about React Native and Mobile App Development experience). One real RN project exists already (candidate video intake app: Expo + Groq Whisper/Llama); this is the second, stronger proof.
2. **FDE / full-stack AI roles** — the app demonstrates full-stack thinking (real auth, real payments), not just UI polish.
3. **The actual portfolio** — a link sent to recruiters and freelance clients. It must hold up as a real "here's who I am and what I've built" experience.

## The three-act structure

1. **Entry** — real Clerk auth (sign up / login) doubling as a designed "who are you and why are you here?" moment (visitor type + reason, stored as user metadata).
2. **Portfolio** — the animation-heavy core, unlocked after auth: reverse-scroll section, big smooth scroll, shared-element morphs, gesture-physics deck. Showcases Vibely, SpeakWell, Kodean, the candidate-intake RN app, and this app itself.
3. **Exit** — "buy me a coffee / sponsor me" Stripe tip screen (test mode), closing the arc.

---

## ⭐ The Premium Bar — standing acceptance criterion for EVERY phase

The entire app must read as **premium**: premium fonts, high-class animation, best color grading. This is enforced per-phase, not deferred to polish.

- **Typography:** No default system font anywhere. Premium-feeling, $0 fonts from Fontshare/Google via `expo-font` — e.g. **Clash Display** or **Cabinet Grotesk** (display) + **Satoshi** or **General Sans** (body). Real typographic scale; tightened letter-spacing on display sizes.
- **Color grading:** Deliberate cinematic dark palette defined in Phase 1 — near-black base, one signature accent, layered elevation tints, subtle gradients/grain. Never stock template colors.
- **Motion language:** One shared vocabulary in `theme.ts` — named easing curves (emphasized-decelerate family), duration tiers (~250 / 400 / 600ms), named spring configs, reused everywhere. No default `Easing.ease`. Every animation choreographed (stagger → overshoot → settle). 60fps on-device is mandatory.
- **Micro-interactions:** Pressed states, haptics (`expo-haptics`), and transitions on every interactive element — added in the phase that builds the element, never retrofitted.
- **Enforcement:** every phase's Definition of Done includes *"meets the art-direction spec."*

---

## Architecture decisions (locked)

1. **Auth = Clerk** (`@clerk/clerk-expo`). First-class Expo SDK, runs in Expo Go (pure JS), `unsafeMetadata` natively stores custom sign-up fields (visitor type + reason) with zero backend, free tier 10k MAU. Supabase Auth would need a profiles table + extra wiring for the same result; it remains the fallback only if Clerk surprises us.
2. **Expo Go for Phases 1–5; development build only from Phase 6.** Reanimated 3, Moti, gesture-handler, and Clerk all run in Expo Go. Only `@stripe/stripe-react-native` (native module) forces a dev build. To de-risk the late switch, Phase 1 configures EAS and fires **one** background Android dev build to validate the pipeline early — daily iteration stays on Expo Go.
3. **Stripe backend = one serverless function** (Vercel free tier; Supabase Edge Function as alternative) creating a PaymentIntent. App uses PaymentSheet with tip presets. Test-mode keys only; live mode is a documented key-flip for later.
4. **Distribution (Windows dev machine, no Apple account):** shareable artifact = **Android APK via EAS internal distribution** + a polished **demo video** for iOS-only viewers. iOS TestFlight is out (needs $99 Apple account — violates zero-cost).
5. **Session continuity:** Phase 1 creates `CLAUDE.md` (stack, conventions, premium bar as standing rule). Every phase ends by updating the **Progress** section below.

**Zero-cost audit:** Expo/EAS free tier ✅ · Clerk free 10k MAU ✅ · Stripe test mode free ✅ · Vercel serverless free ✅ · Fontshare/Google fonts free-for-commercial ✅ · No Apple account needed (Android-first) ✅

---

# The Phases

## Phase 1 — Scaffold, Art Direction & Pipeline

**Goal:** A running Expo app with the three-act skeleton, animation stack verified, and — critically — the art-direction spec that every later phase inherits.

**In scope:**
- Expo app (TypeScript) + Expo Router; route groups `(entry)`, `(portfolio)`, `(exit)` with placeholder screens
- Install/configure Reanimated 3 (babel plugin), Moti, gesture-handler (`GestureHandlerRootView` at root); verify with one trivial animation on-device
- **Art-direction spec + theme tokens** (`theme.ts`): cinematic dark palette, Fontshare fonts via `expo-font`, type scale, spacing/radius, motion vocabulary (named easings, duration tiers, spring configs)
- **Style tile screen** — one screen showing type + palette + a sample animated element; the premium litmus test
- `content/projects.ts` — real data for Vibely, SpeakWell, Kodean, the candidate-intake app, and this app (name, role, stack, description, links). No later phase blocks on content
- `CLAUDE.md` — stack, conventions, phase protocol, premium bar
- EAS init + one background Android development build (pipeline validation only)

**Out of scope:** auth logic, real animation work, Stripe, app icon/splash.

**Model-effort:** **Fable/Opus · medium-high.** The art-direction spec is taste-heavy and everything downstream inherits it — the cheapest place to spend top-tier judgment. (The config work alone would be Sonnet-medium.)

**Depth/iteration:** Medium. Config is linear; the style tile deserves 1–2 taste iterations.

**Dependencies:** None. Needs: Node, Android device with Expo Go (or emulator), Expo account.

**Definition of done:**
- App runs in Expo Go on device; can navigate all three placeholder acts
- Custom fonts render; test Reanimated animation at 60fps
- Style tile looks unmistakably premium (fonts + palette + motion sample)
- `theme.ts`, `content/projects.ts`, `CLAUDE.md` exist
- EAS Android dev build completed successfully (not used yet — just proven)

---

## Phase 2 — Entry Act: Clerk Auth + Designed Onboarding

**Goal:** Real sign-up/login gating the portfolio, with the "who are you / why are you here?" capture feeling designed, not like a form.

**In scope:**
- Clerk dashboard setup + `ClerkProvider` with `expo-secure-store` token cache
- **Custom flows** via `useSignUp` / `useSignIn` hooks (not prebuilt components — full visual control): email + password, email-code verification
- Multi-step onboarding: ① credentials → ② visitor type as big tappable cards (recruiter / potential client / just browsing) → ③ one-line "why are you here?" → all stored in `unsafeMetadata`
- Moti stagger/fade transitions between steps (first real Moti usage, deliberately where stakes are low)
- Route protection: `(portfolio)` and `(exit)` require a session; signed-in users skip entry
- Sign-out (lives in portfolio, returns to entry)
- Premium bar: haptic feedback on selections, pressed states, choreographed step transitions

**Out of scope:** social OAuth (stretch only if the session runs fast), password-reset polish, profile editing, portfolio content.

**Model-effort:** **Sonnet 5 · high.** Docs-driven integration; verification-flow edge cases (pending states, error handling, session restore) punish shallow effort, but nothing is novel.

**Depth/iteration:** Medium — one or two loops on verification edge cases.

**Dependencies:** Phase 1.

**Definition of done:**
- Full on-device round trip: sign up with visitor type + reason → land in portfolio → kill app → reopen, still signed in → sign out → portfolio inaccessible again
- Metadata visible in Clerk dashboard; login with existing account works
- Onboarding feels like a designed experience (meets art-direction spec)

---

## Phase 3 — Portfolio Shell + Reverse-Scroll Flagship

**Goal:** Portfolio structure plus the single most distinctive animation — the mayaresearch.ai-style reverse-scroll section.

**In scope:**
- Portfolio home layout: hero, section scaffolding, flow into later sections
- Hero personalized from Clerk metadata — "Welcome, recruiter 👋" with copy variants per visitor type (auth pays off visibly here)
- **Reverse-scroll section:** pinned container occupying N× viewport of scroll length; `useAnimatedScrollHandler` normalizes scroll into a 0→1 progress shared value; content columns get inverse `translateY` via `interpolate` — one column with scroll, one against. All UI-thread
- Project cards inside the reverse-scroll columns, fed by `content/projects.ts`

**Out of scope:** big-scroll section, project detail screens, card deck, Stripe.

**Model-effort:** **Fable/Opus · high.** Novel animation composition with no off-the-shelf recipe; the pinning strategy and progress math are architecture decisions — wrong structure = rewrite.

**Depth/iteration:** High — expect 2–3 on-device tuning loops (scroll-length ratio, interpolation ranges, boundary clamping).

**Dependencies:** Phases 1–2 (theme, content, metadata for the hero).

**Definition of done:**
- Reverse-scroll at solid 60fps on a real Android device, no JS-thread jank (check perf monitor)
- Boundary behavior feels intentional at both ends
- Hero copy changes with visitor type
- Meets art-direction spec

---

## Phase 4 — Big Smooth Scroll Section (the Lenis Equivalent)

**Goal:** A long scroll-driven journey with the buttery momentum feel of GSAP+Lenis on web — rebuilt on Reanimated's UI thread.

**In scope:**
- Custom momentum scrolling: `Gesture.Pan` + `withDecay` driving a shared value, **or** a smoothed spring-follow of native scrollY — quick spike first, then commit (this is the phase's key technical decision)
- Long virtual canvas divided into "scenes," each animating (parallax layers, scale/opacity/clip reveals) off the global progress value
- ≥3 distinct scroll-tied scenes (e.g., skills reveal, stats counters, career timeline)
- Optional snap-to-scene points
- Performance discipline: zero per-frame React re-renders — everything through shared values + `useAnimatedStyle`

**Out of scope:** everything else; no new content types.

**Model-effort:** **Fable/Opus · high.** Custom scroll physics is the hardest technical piece in the project; decay + clamping + rubber-banding feel is where a strong model saves a day of flailing.

**Depth/iteration:** Highest of any phase — budget 2–3 rework loops on the physics feel alone.

**Dependencies:** Phase 3 (portfolio shell to slot into; scroll-progress patterns established there are reused).

**Definition of done:**
- Natural momentum and deceleration on-device; fling, slow-drag, and boundary behavior all feel deliberate
- ≥3 scenes animate off progress; 60fps sustained
- Meets art-direction spec

---

## Phase 5 — Pattern Breadth Trio

**Goal:** 2–3 more distinct patterns chosen for *novelty vs the GSAP/Lenis web background* — layout transitions and gesture physics, the two big RN animation domains with no GSAP equivalent.

**In scope:**
- **(a) Shared-element morph:** tap a project card → expands into a full detail screen (image/title continuously morphing). Manual animated-overlay technique (measure origin → animate portal overlay → crossfade) — deliberately **not** Reanimated's experimental shared-transitions API (flaky with Expo Router)
- **(b) Gesture-physics card deck:** swipeable stacked cards (skills / testimonials / fun facts) — `Gesture.Pan` + `withSpring` snap-back, rotation tied to drag, velocity-based dismiss via `withDecay`, haptics on commit. Teaches interruptible gesture-driven animation
- **(c) Stretch — Skia:** scroll/touch-reactive shader or grain-gradient background via `@shopify/react-native-skia`. Elevated relevance under the premium bar: Skia grain/gradient is the cheapest path to a graded, non-flat cinematic look. Fallback: layered `expo-linear-gradient`

**Out of scope:** Skia if time runs short (droppable without guilt), new content, refactoring earlier sections.

**Model-effort:** **Sonnet 5 · high** — each pattern is individually well-documented; the session is about breadth. **Bump to Fable/Opus if attempting the Skia stretch** (shader work is genuinely harder).

**Depth/iteration:** Medium per pattern — one careful measure/layout loop for the morph; spring-config tuning for the deck.

**Dependencies:** Phase 3 (project cards to morph from). Independent of Phase 4 — swappable if you want a lighter session after the physics-heavy one.

**Definition of done:**
- Card→detail morph feels continuous — no flash or jump
- Deck swipes with believable physics + spring-back + haptics
- Both integrated into the portfolio flow (not demo screens)
- Skia either shipped or consciously dropped (recorded in Progress)
- Meets art-direction spec

---

## Phase 6 — Exit Act: Stripe Tips

**Goal:** The closing act — "buy me a coffee" with real Stripe PaymentSheet in test mode, completing the full-stack story.

**In scope:**
- Switch to development build: `expo-dev-client` + `@stripe/stripe-react-native` + config plugin, rebuild (pipeline pre-validated in Phase 1)
- One serverless endpoint (Vercel free tier) creating a PaymentIntent from an amount
- Tip screen: preset amounts ($3 / $5 / $10) as designed tappable cards → PaymentSheet flow, test-mode keys only
- Success celebration animation (confetti/springs — reuse now-deep Reanimated skills) + thank-you/sign-off screen closing the narrative arc (message, links, replay option)
- Graceful decline/cancel handling

**Out of scope:** live mode (documented one-line key flip for later), Apple/Google Pay, webhooks, receipts.

**Model-effort:** **Sonnet 5 · medium-high.** Heavily documented integration; the risk is build/config, not logic — mostly defused by Phase 1's pipeline validation.

**Depth/iteration:** Low-medium — rebuild + endpoint + happy path, then one loop on error states.

**Dependencies:** Phases 1–2 (EAS pipeline, auth). Content-independent of 3–5, but sequenced here so the native-build switch happens exactly once, late, after all Expo Go iteration is done.

**Definition of done:**
- On the dev build: tip → PaymentSheet → test card `4242 4242 4242 4242` succeeds → payment visible in Stripe test dashboard → celebration plays → thank-you screen
- Decline card `4000 0000 0000 0002` shows a graceful error
- Meets art-direction spec

---

## Phase 7 — Polish, Performance & Ship

**Goal:** Turn a working app into a shareable portfolio artifact.

**In scope:**
- Performance audit: perf-monitor pass over every section on a mid-range Android device; hunt stray re-renders; verify all animation is UI-thread
- **Reduce-motion accessibility** (respect the OS setting — great interview talking point)
- App icon + splash screen, error/empty states, final copy pass
- **EAS Android APK** with internal-distribution link — the URL that goes in applications
- README with GIFs of each animation pattern + architecture notes (recruiters who can't install still see the work)
- Demo video (60–90s screen recording of the full arc) — covers iOS-only viewers
- Close out Progress with sharing notes (what link/video goes where in the YoLearn.ai form)

**Out of scope:** new features, iOS distribution, live Stripe.

**Model-effort:** **Sonnet 5 · medium**; README/copy sub-tasks fine on **Haiku** if routed separately.

**Depth/iteration:** Low — checklist-driven.

**Dependencies:** all previous phases.

**Definition of done:**
- Fresh device installs the APK from the share link and completes the entire journey (sign up → onboarding → portfolio, all animations smooth → tip with test card) with no crashes
- README + demo video done; reduce-motion respected

---

## Model-effort routing at a glance

| Phase | Name | Model | Effort |
|---|---|---|---|
| 1 | Scaffold + Art Direction | Fable/Opus | medium-high |
| 2 | Clerk Auth + Onboarding | Sonnet 5 | high |
| 3 | Reverse-Scroll Flagship | Fable/Opus | high |
| 4 | Big Smooth Scroll | Fable/Opus | high |
| 5 | Pattern Breadth Trio | Sonnet 5 (Opus if Skia) | high |
| 6 | Stripe Exit | Sonnet 5 | medium-high |
| 7 | Polish & Ship | Sonnet 5 (Haiku for copy) | medium |

## Why this order

Scaffold first (everything depends on tooling + the art-direction spec). Auth second — low-risk, gates everything, and its visitor metadata is what makes Phase 3's hero personal, so it *feeds* the animation phases instead of being a chore. Animations 3→5 in descending novelty: the hardest, highest-value work while energy is fresh; breadth later. Stripe at 6 isolates the only native-build switch to a single late point, pre-validated in Phase 1. Polish last. Phases 4 and 5 are swappable.

## The full journey (sanity check)

A recruiter taps the link, installs the APK, and signs up — but instead of a boring form, a designed three-step onboarding asks who they are and why they came (real Clerk auth, metadata stored). The portfolio opens with a hero that greets *them specifically*, then flows through a reverse-scroll project showcase, a long momentum-smoothed scroll journey, project cards that morph into detail views, and a physics-driven card deck — all in a graded cinematic dark theme with premium type. At the end, "enjoyed this? buy me a coffee" runs a real Stripe PaymentSheet (test mode), and a celebration + sign-off closes the arc. Output artifact: APK link + demo video + README — ready for the YoLearn.ai form the day Phase 7 ends.

---

## Progress

> Update this section at the end of every session.

- [x] **Phase 0 — Planning** (2026-07-12): PLAN.md created. No code yet.
- [x] **Phase 1 — Scaffold, Art Direction & Pipeline** (2026-07-12): Expo app scaffolded
  (Expo Router, TS, New Arch), then **downgraded from SDK 57 → SDK 54** to match the Expo
  Go app actually published on the Play Store / App Store (57 exists but isn't installable
  yet). Three-act routes live (`/`, `/style-tile`, `/portfolio`, `/exit`). Animation stack
  installed + bundle-verified on SDK 54 (Reanimated 4.1, Moti, gesture-handler, worklets;
  `expo-doctor` 18/18, tsc clean, full `expo export` succeeds). Art-direction spec in
  `src/theme/theme.ts`, Clash Display + Satoshi fonts loading, style tile built.
  `content/projects.ts`, `CLAUDE.md`, `eas.json` done. Git repo initialized on `main`,
  remote set to `iamsiddhesh-dev/portfolio`. **Blocked on user:** on-device Expo Go check +
  EAS build login (see handoff).
- [x] **Phase 2 — Clerk Auth + Onboarding** (2026-07-13): Merged to `main` (was
  `feature/phase-2-clerk-auth`), pushed to GitHub. Custom email+password flow via
  `useSignUp` / `useSignIn` (`@clerk/expo`, **not** `@clerk/clerk-expo`, **pinned to exact
  `3.0.1`** — see handoff, this matters), 3-step onboarding (credentials → visitor-type
  cards → reason) with Moti crossfades, `unsafeMetadata` capture, `Stack.Protected` route
  guards, sign-out in portfolio, hero copy personalized by visitor type. tsc / `expo lint` /
  `expo export` clean; `expo-doctor` 17/18 (one accepted false-positive, see handoff).
  `.env.local` has a real publishable key now. `AGENTS.md` fixed same session (was pointing
  at stale SDK 57 docs). **Still blocked on user:** the on-device auth round trip hasn't
  been run/confirmed from here (see handoff checklist).
- [ ] Phase 3 — Reverse-Scroll Flagship
- [ ] Phase 4 — Big Smooth Scroll
- [ ] Phase 5 — Pattern Breadth Trio
- [ ] Phase 6 — Stripe Exit
- [ ] Phase 7 — Polish & Ship

### Handoff notes (after Phase 1)

**Stack reality vs plan:** Pinned to **SDK 54**, not the newer 57, because the Expo Go app
on the Play Store / App Store only supports 54 — testing on-device would break on 57. SDK
54 still ships **Reanimated 4.1** (not 3) + `react-native-worklets` on the New Architecture.
The worklets babel plugin is auto-configured by `babel-preset-expo` — there is intentionally
**no `babel.config.js`**. Moti 0.30 bundles cleanly against Reanimated 4.1 (confirmed via
`expo export` + `expo-doctor` 18/18); runtime feel still to be eyeballed on device.
**Going forward: work on feature branches, never commit straight to `main`.**

**Decisions locked this phase:** Fonts = **Clash Display + Satoshi** (Fontshare, in
`assets/fonts/`). Accent = **warm amber/gold** (`#F3C57C`). App is **dark-locked**.

**Two DoD items need the user (couldn't be done from here):**
1. **On-device Expo Go run** — `npm start`, scan QR on an Android device. Verify: navigate
   entry → style-tile → portfolio → exit; Clash/Satoshi render; orb breathes at 60fps
   (toggle the perf monitor).
2. **EAS Android build (pipeline validation)** — needs Expo login (I can't auth):
   `npx eas-cli login` → `npx eas-cli init` → `npx eas-cli build -p android --profile preview`.
   `eas.json` already has development/preview/production profiles. `init` writes the
   `projectId` into `app.json`.

**Content debt:** `src/content/projects.ts` — Vibely, SpeakWell, Kodean entries are
DRAFT (marked `draft: true`), written from names + the plan. Candidate-intake app and
this app are accurate. Real descriptions/roles/years/links needed before Phase 3 renders
them prominently — **still not fixed, carries forward into Phase 3.**

### Handoff notes (after Phase 2)

**✅ AGENTS.md fixed.** It used to say "Expo HAS CHANGED — read the v57 docs," contradicting
the SDK 54 pin in `CLAUDE.md`/this file. Rewrote it to state the pin correctly and point at
v54 docs, so a future session won't follow it into a breaking 57 upgrade.

**⚠️ `@clerk/expo` is pinned to exact `3.0.1`, not the latest `3.7.4` — do not `npm update`
or re-`expo install` it without reading this.** Installing latest (`3.7.4`) crashes
immediately in Expo Go: `Error: Cannot find native module 'ClerkExpo'`. Starting at
`3.1.0`, `@clerk/expo`'s main entrypoint unconditionally calls
`expo.requireNativeModule('ClerkExpo')` at module-eval time (in
`dist/specs/NativeClerkModule.android.js`, pulled in by `ClerkProvider` itself) — a real
native module that only exists in a custom dev client, never in the stock Expo Go app. This
directly contradicts this plan's Architecture Decision #2 ("Auth = Clerk... runs in Expo Go
(pure JS)").
- I diffed tarballs across `3.0.0` → `3.6.x` (`npm pack @clerk/expo@<version>`, grep for
  `dist/specs/`) and found `3.0.0`/`3.0.1` are the only Core 3 releases with **zero** native
  specs — the mandatory native module was introduced at `3.1.0`. `3.0.1` still has the same
  step-method API described below (Core 3 was the `3.0.0` rename itself), so nothing about
  the auth code had to change — only the installed version.
  `package.json` pins it as `"@clerk/expo": "3.0.1"` (no `^`) specifically so a routine
  `npm install`/`expo install` doesn't silently pull `3.7.x` back in and reintroduce the
  crash. If a later phase needs something only in a newer version (e.g. passkeys), that's a
  deliberate call to make then — re-verify Expo Go compatibility first, or accept the
  project needs to move to a dev client earlier than Phase 6.
- This did cost one `expo-doctor` check: `3.0.1` still lists `expo-modules-core` as a
  *required* peer dependency, but Expo's own guidance says never install
  `expo-modules-core` directly (it should come transitively via the `expo` package — which
  it already does, confirmed present at `node_modules/expo-modules-core`). Installing it
  directly to silence the peer-dep warning immediately trips a *different*, more emphatic
  doctor check ("should not be installed directly"). I left it uninstalled and accepted the
  peer-dep warning as the lesser, false-positive one — **`expo-doctor` is 17/18, not 18/18,
  and that's expected.**

**Clerk shipped a new API generation ("Core 3") since this plan was written — the plan's
own code sketches (`useSignUp`/`useSignIn`, `unsafeMetadata`) are directionally right but
the method names in Phase 2's spec are from the old API.** What actually shipped:
- Package is **`@clerk/expo`** (not `@clerk/clerk-expo` as CLAUDE.md's stack section used
  to say — fixed there too this session). Installed version pinned to `3.0.1` — see the
  Expo Go native-module note above for why.
- No more `signUp.create()` / `prepareEmailAddressVerification()` / `setActive()`. The new
  "Future" API is step-method-shaped: `signUp.password({ emailAddress, password })` →
  `signUp.verifications.sendEmailCode()` → `signUp.verifications.verifyEmailCode({ code })`
  → (optionally `signUp.update({ unsafeMetadata })` before completion) →
  `signUp.finalize({ navigate })` to actually activate the session. Sign-in mirrors this:
  `signIn.password(...)` → `signIn.finalize(...)`, with `signIn.mfa.*` for second-factor /
  new-device client-trust flows (not built out this phase — out of scope, see below).
- I verified all of this against the **installed package's own `.d.ts` files** under
  `node_modules/@clerk/expo/node_modules/@clerk/{react,shared}/dist/types/` (mainly
  `signUpFuture.d.ts`, `signInFuture.d.ts`, `state.d.ts`, `hooks.d.ts`) after Clerk's own
  docs pages kept 404ing on fetch — that's ground truth, not guesswork.
- `unsafeMetadata` is typed via global module augmentation now, added at
  [`src/types/clerk.d.ts`](src/types/clerk.d.ts): `{ visitorType, reason }`.

**Route protection uses Expo Router's `Stack.Protected`** (`src/app/_layout.tsx`), gated on
`useAuth().isSignedIn`. This required adding a `_layout.tsx` to each of `(entry)`,
`(portfolio)`, `(exit)` — a route group can only be addressed as one unit
(`<Stack.Screen name="(entry)" />`) in the parent Stack if it has its own layout file.
Signed-out → only `(entry)` reachable; signed-in → `(entry)` disappears entirely and
`(portfolio)` + `(exit)` become reachable, landing on `/portfolio`.

**`style-tile` is now unreachable while signed in** — it lives inside `(entry)`, which
`Stack.Protected` removes once `isSignedIn`. Was a deliberate call (it's a Phase-1 dev
reference screen, not part of the three-act narrative) but flag it in case that's wrong.

**Onboarding flow** (`src/app/(entry)/index.tsx` + `src/components/onboarding/*`): single
screen, internal step state (`credentials → visitorType → reason`), Moti crossfade between
steps via `StepShell`. Sign-up path walks all three steps and only calls `signUp.finalize()`
after `unsafeMetadata` is attached (step 3) — so the session isn't created until onboarding
is actually complete. Sign-in path (existing users) finalizes immediately after password,
skipping visitor-type/reason, matching "login with existing account works."

**Out of scope, same as plan:** social OAuth, password reset, profile editing, and — new
this phase — second-factor/client-trust verification (`signIn.mfa`) beyond a generic error
message if `signIn.status` isn't `'complete'` after password. Fine for a solo dev's own
Clerk instance with password + email-code sign-up (the enabled strategies below); would need
building out if MFA or new-device trust get enabled later.

**Three things need the user (couldn't be done from here — no Clerk account exists):**
1. **Create a Clerk app** at [dashboard.clerk.com](https://dashboard.clerk.com). In
   **User & Authentication → Email, Phone, Username**, enable **Email address** as an
   identifier with **password** and **email verification code** as strategies (these are
   what `CredentialsStep.tsx` drives). Social/passwordless can stay off — unused this phase.
2. **Get the publishable key** from **API Keys** in the dashboard, copy `.env.example` to
   `.env.local` (gitignored), and set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...` there.
   The app throws a clear error at startup if this is missing.
3. **On-device round trip** (`npm start`, Expo Go): sign up with a real email → enter the
   code from the actual email → pick a visitor type → answer "why are you here?" → land in
   portfolio with the personalized greeting → kill the app → reopen, still signed in → sign
   out → confirm `/portfolio` and `/exit` are unreachable and you're back at onboarding →
   sign back in with the same account and confirm it skips straight to portfolio. Then check
   the Clerk dashboard's **Users** tab that `unsafeMetadata` shows the visitor type + reason.

**This is merged to `main` and pushed to GitHub already** (done at the user's explicit
request, ahead of the on-device verification above — normally we'd verify first).

**Deferred to later phases (by design):** film grain → Phase 5 (Skia); the Screen grade
currently uses layered gradients (base + amber glow + vignette). App icon/splash art → Phase 7.
