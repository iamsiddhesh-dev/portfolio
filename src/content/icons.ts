/**
 * Link-icon assets. Project links carry a semantic `icon` key (see `ProjectLink`)
 * rather than an import, so the content stays a plain data file; this module is
 * the one place that resolves a key to its image. Icons live as tintable SVGs in
 * `assets/icons/` — rendered via `expo-image` (which supports SVG + `tintColor`),
 * so a single monochrome asset takes on whatever theme colour the caller wants.
 *
 * Relative requires (not the `@/assets` alias) mirror `fonts.ts` — the proven,
 * reliable path for Metro asset resolution in this project.
 */
import type { ImageSourcePropType } from 'react-native';

export type IconKey = 'github' | 'demo' | 'linkedin' | 'mail';

export const iconSources: Record<IconKey, ImageSourcePropType> = {
  github: require('../../assets/icons/github.svg'),
  demo: require('../../assets/icons/browser.svg'),
  linkedin: require('../../assets/icons/linkedin.svg'),
  mail: require('../../assets/icons/mail.svg'),
};
