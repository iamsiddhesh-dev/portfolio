/**
 * Base screen chrome — the cinematic dark grade that sits under every act:
 *  · warm near-black base gradient
 *  · a soft amber light source bleeding from the top
 *  · a bottom vignette sinking content into the dark
 *
 * Grain/film texture is intentionally deferred to Phase 5 (Skia) per the plan;
 * the layered gradients already establish the graded, non-flat look.
 */
import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/theme/theme';

type ScreenProps = PropsWithChildren<{
  /** Which safe-area edges to inset. Defaults to top+bottom. */
  edges?: Edge[];
  /** Show the amber glow at the top. On by default. */
  glow?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}>;

export function Screen({
  children,
  edges = ['top', 'bottom'],
  glow = true,
  style,
  contentStyle,
}: ScreenProps) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient colors={theme.gradients.base} style={StyleSheet.absoluteFill} />
      {glow ? (
        <LinearGradient
          colors={theme.gradients.glow}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
          style={styles.glow}
          pointerEvents="none"
        />
      ) : null}
      <LinearGradient
        colors={theme.gradients.vignette}
        style={styles.vignette}
        pointerEvents="none"
      />
      <SafeAreaView edges={edges} style={[styles.safe, contentStyle]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  vignette: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  safe: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
});
