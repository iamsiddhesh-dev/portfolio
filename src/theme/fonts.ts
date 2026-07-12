/**
 * Typography assets — Clash Display (display) + Satoshi (body), both from
 * Fontshare, free for commercial use. Loaded via `expo-font` in the root layout.
 *
 * `Fonts` holds the PostScript family names Metro registers the .otf under;
 * reference these from `theme.type`, never a raw string.
 */

export const Fonts = {
  // Clash Display — expressive grotesk, reserved for display / headings
  displayRegular: 'ClashDisplay-Regular',
  displayMedium: 'ClashDisplay-Medium',
  displaySemibold: 'ClashDisplay-Semibold',
  displayBold: 'ClashDisplay-Bold',
  // Satoshi — clean geometric grotesk, body + UI
  bodyLight: 'Satoshi-Light',
  bodyRegular: 'Satoshi-Regular',
  bodyMedium: 'Satoshi-Medium',
  bodyBold: 'Satoshi-Bold',
  bodyBlack: 'Satoshi-Black',
} as const;

/** Passed straight to `useFonts()`. Relative requires so Metro resolves assets reliably. */
export const fontAssets = {
  [Fonts.displayRegular]: require('../../assets/fonts/ClashDisplay-Regular.otf'),
  [Fonts.displayMedium]: require('../../assets/fonts/ClashDisplay-Medium.otf'),
  [Fonts.displaySemibold]: require('../../assets/fonts/ClashDisplay-Semibold.otf'),
  [Fonts.displayBold]: require('../../assets/fonts/ClashDisplay-Bold.otf'),
  [Fonts.bodyLight]: require('../../assets/fonts/Satoshi-Light.otf'),
  [Fonts.bodyRegular]: require('../../assets/fonts/Satoshi-Regular.otf'),
  [Fonts.bodyMedium]: require('../../assets/fonts/Satoshi-Medium.otf'),
  [Fonts.bodyBold]: require('../../assets/fonts/Satoshi-Bold.otf'),
  [Fonts.bodyBlack]: require('../../assets/fonts/Satoshi-Black.otf'),
};
