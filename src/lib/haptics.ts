/**
 * Thin wrapper over expo-haptics. Every interactive element in the app speaks
 * through this so haptic language stays consistent and web/unsupported platforms
 * degrade to silent no-ops instead of throwing.
 */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

export const haptics = {
  /** Light tick — selection changes, tab switches, card focus. */
  selection() {
    if (enabled) Haptics.selectionAsync().catch(() => {});
  },
  /** Soft tap — primary button press-in. */
  light() {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  /** Firmer tap — commits, confirms. */
  medium() {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  /** Success cadence — completions, arrivals, celebrations. */
  success() {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  /** Warning cadence — errors, declines. */
  warning() {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
