/**
 * A slow-breathing amber orb — the app's Reanimated litmus test. Everything here
 * runs on the UI thread (shared values + withRepeat), so it holds 60fps even while
 * JS is busy. Doubles as the recurring "light source" motif in the dark grade.
 */
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '@/theme/theme';

export function AccentOrb({ size = 180 }: { size?: number }) {
  const breath = useSharedValue(0);

  useEffect(() => {
    // 0 → 1 → 0 forever; a long, cinematic inhale/exhale.
    breath.value = withRepeat(
      withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [breath]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + breath.value * 0.35 }],
    opacity: 0.35 + breath.value * 0.4,
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.98 + breath.value * 0.06 }],
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {/* diffuse outer glow */}
      <Animated.View
        style={[
          styles.glow,
          { width: size, height: size, borderRadius: size / 2 },
          glowStyle,
        ]}
      />
      {/* ember core */}
      <Animated.View
        style={[
          styles.core,
          { width: size * 0.62, height: size * 0.62, borderRadius: size },
          coreStyle,
        ]}
      >
        <LinearGradient
          colors={theme.gradients.ember}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* top-left specular highlight */}
        <View style={styles.specular} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: theme.colors.accent,
    // large soft shadow reads as a radial bloom on both platforms
    shadowColor: theme.colors.accent,
    shadowOpacity: 0.9,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    elevation: 24,
  },
  core: {
    overflow: 'hidden',
    shadowColor: theme.colors.accentBright,
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
  },
  specular: {
    position: 'absolute',
    top: '14%',
    left: '18%',
    width: '34%',
    height: '22%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.5)',
    opacity: 0.6,
  },
});
