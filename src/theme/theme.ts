/**
 * ────────────────────────────────────────────────────────────────────────────
 *  ART-DIRECTION SPEC  ·  the single source of truth every phase inherits
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  Mood        Cinematic, warm near-black. Editorial, expensive, unhurried.
 *  Accent      ONE signature — warm amber/gold. Used sparingly, as light.
 *  Type        Clash Display (display) over Satoshi (body). Tight display tracking.
 *  Motion      Emphasized-decelerate family. Nothing linear. Everything settles.
 *
 *  Rules of the house:
 *   · The app is dark-locked. There is no light mode. Design for the dark.
 *   · Amber is a highlight, not a fill colour. If everything glows, nothing does.
 *   · Elevation is communicated with warm surface tints + hairlines, not shadows.
 *   · Never a raw system font. Never `Easing.ease`. Never an un-choreographed move.
 */

import { Easing, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';

import { Fonts } from './fonts';

/* ── Colour — warm near-black base, layered elevation, single amber accent ── */

export const colors = {
  // Base surfaces — warm-neutral, near-black, ascending elevation
  bg: '#0B0A0C', //            app background, the void
  surface: '#141216', //       raised card / sheet
  surfaceRaised: '#1C1A20', // card-on-card
  surfaceHi: '#26232B', //     pressed / hover / highest
  hairline: 'rgba(245, 240, 232, 0.08)', // borders, dividers
  hairlineStrong: 'rgba(245, 240, 232, 0.14)',

  // Signature accent — warm amber / gold. This is the light in the room.
  accent: '#F3C57C', //        primary amber-gold
  accentBright: '#FFDA92', //  hover / emphasis
  accentDim: '#C79A55', //     de-emphasised amber
  accentInk: '#1A1206', //     text/icons *on* an amber fill (near-black brown)
  accentGlow: 'rgba(243, 197, 124, 0.16)', // ambient glow washes

  // Text — warm off-whites, never pure #fff
  text: '#F4F1EA', //          primary
  textSecondary: '#A8A29A', // secondary / supporting
  textMuted: '#6C665E', //     captions, disabled, metadata

  // Utility
  success: '#82D3A0',
  danger: '#E88870',
  scrim: 'rgba(6, 5, 8, 0.72)', // modal / overlay backdrop
} as const;

/** Multi-stop gradients (consumed by expo-linear-gradient). */
export const gradients = {
  /** Barely-there vertical lift on the base background. */
  base: ['#0C0B0E', '#0A090C', '#08070A'] as const,
  /** Amber → copper, for accent fills that need depth (buttons, orbs). */
  ember: ['#FFD98A', '#F3C57C', '#C97E3F'] as const,
  /** Radial-ish top glow, fades to nothing. Layer over base for a light source. */
  glow: ['rgba(243, 197, 124, 0.18)', 'rgba(243, 197, 124, 0.04)', 'rgba(243, 197, 124, 0)'] as const,
  /** Bottom vignette to sink content into the dark. */
  vignette: ['rgba(6, 5, 8, 0)', 'rgba(6, 5, 8, 0.55)'] as const,
} as const;

/* ── Typography — real scale, tightened tracking on display sizes ── */

type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
};

export const type = {
  /** Poster-scale hero. Clash Bold, heavily tracked-in. */
  display: { fontFamily: Fonts.displayBold, fontSize: 56, lineHeight: 58, letterSpacing: -1.8 },
  h1: { fontFamily: Fonts.displaySemibold, fontSize: 40, lineHeight: 44, letterSpacing: -1.1 },
  h2: { fontFamily: Fonts.displayMedium, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  h3: { fontFamily: Fonts.displayMedium, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  /** Large lead paragraph. Satoshi, generous leading. */
  bodyLg: { fontFamily: Fonts.bodyRegular, fontSize: 18, lineHeight: 28, letterSpacing: 0 },
  body: { fontFamily: Fonts.bodyRegular, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  bodyMed: { fontFamily: Fonts.bodyMedium, fontSize: 16, lineHeight: 24, letterSpacing: 0 },
  label: { fontFamily: Fonts.bodyMedium, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  caption: { fontFamily: Fonts.bodyRegular, fontSize: 13, lineHeight: 18, letterSpacing: 0.2 },
  /** All-caps eyebrow. Wide tracking. Pair with textMuted or accent. */
  overline: { fontFamily: Fonts.bodyBold, fontSize: 11, lineHeight: 14, letterSpacing: 2.4 },
} satisfies Record<string, TypeStyle>;

export type TypeVariant = keyof typeof type;

/* ── Spacing — 4pt base, named for intent ── */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 72,
} as const;

/* ── Radius ── */

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

/* ── Motion vocabulary — reused everywhere, never re-invented per component ──
 *
 *  Curves        emphasized* — the Material 3 emphasized family. Decelerate for
 *                entrances (fast-in, long settle), accelerate for exits.
 *  Durations     three tiers. Micro ~250 · standard ~400 · grand ~600.
 *  Springs       four temperaments, keyed by *feel* not by numbers.
 */

export const easing = {
  /** Entrances & most transitions. Fast start, long graceful settle. */
  emphasized: Easing.bezier(0.2, 0, 0, 1),
  /** Exits. Content leaving the screen accelerates away. */
  emphasizedAccel: Easing.bezier(0.3, 0, 1, 1),
  /** Deep decelerate for large hero moves. */
  emphasizedDecel: Easing.bezier(0.05, 0.7, 0.1, 1),
  /** Neutral standard curve for small state changes. */
  standard: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

export const duration = {
  fast: 250, //  micro-interactions, taps, toggles
  base: 400, //  standard element transitions
  slow: 600, //  hero / full-screen choreography
} as const;

export const spring = {
  /** Calm, weighty. Default for layout & entrances. */
  gentle: { damping: 18, stiffness: 160, mass: 1 } satisfies WithSpringConfig,
  /** Quick and precise, minimal overshoot. UI that must feel instant. */
  snappy: { damping: 22, stiffness: 320, mass: 0.9 } satisfies WithSpringConfig,
  /** Playful overshoot. Rewards, confirmations, arrivals. */
  bouncy: { damping: 12, stiffness: 220, mass: 1 } satisfies WithSpringConfig,
  /** Tight, near-critically-damped. Press / release scale on buttons. */
  press: { damping: 26, stiffness: 520, mass: 0.7 } satisfies WithSpringConfig,
} as const;

/** Convenience timing config: `withTiming(v, timing.base)`. */
export const timing = {
  fast: { duration: duration.fast, easing: easing.emphasized } satisfies WithTimingConfig,
  base: { duration: duration.base, easing: easing.emphasized } satisfies WithTimingConfig,
  slow: { duration: duration.slow, easing: easing.emphasizedDecel } satisfies WithTimingConfig,
} as const;

/* ── The bundled token object — import `theme` for everything ── */

export const theme = {
  colors,
  gradients,
  type,
  spacing,
  radius,
  easing,
  duration,
  spring,
  timing,
  fonts: Fonts,
} as const;

export type Theme = typeof theme;
