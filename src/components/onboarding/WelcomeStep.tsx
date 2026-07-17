/**
 * The very first thing a visitor sees — a title card, not a form. No "Step X of
 * 3" eyebrow (this is the cover, before onboarding starts counting). Swipe up to
 * continue into credentials; the whole card rides the drag 1:1 and either springs
 * back or flings off past the threshold, same physics language as `CardDeck`. A
 * tappable fallback covers anyone who doesn't pick up the gesture.
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AccentOrb } from '@/components/AccentOrb';
import { StepShell } from '@/components/onboarding/StepShell';
import { Text } from '@/components/Text';
import { haptics } from '@/lib/haptics';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { theme } from '@/theme/theme';

const SWIPE_DISTANCE_THRESHOLD = 70;
const SWIPE_VELOCITY_THRESHOLD = 500;
const FLING_DISTANCE = 500;

export function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  const reducedMotion = useReducedMotion();
  const translateY = useSharedValue(0);
  const hintBob = useSharedValue(0);
  const hintPress = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    hintBob.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [reducedMotion, hintBob]);

  const commit = () => {
    haptics.medium();
    onContinue();
  };

  const pan = Gesture.Pan()
    .activeOffsetY([-12, 12])
    .failOffsetX([-16, 16])
    .onUpdate((e) => {
      translateY.value = Math.min(0, e.translationY);
    })
    .onEnd((e) => {
      const shouldCommit =
        -e.translationY > SWIPE_DISTANCE_THRESHOLD || -e.velocityY > SWIPE_VELOCITY_THRESHOLD;
      if (shouldCommit) {
        translateY.value = withTiming(-FLING_DISTANCE, {
          duration: reducedMotion ? 0 : theme.duration.base,
          easing: theme.easing.emphasizedAccel,
        });
        runOnJS(commit)();
      } else {
        translateY.value = withSpring(0, theme.spring.gentle);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const hintBobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(hintBob.value, [0, 1], [0, -8]) },
      { scale: 1 - hintPress.value * 0.06 },
    ],
    opacity: interpolate(hintBob.value, [0, 1], [0.65, 1]),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.root, cardStyle]}>
        <View style={styles.orb} pointerEvents="none">
          <AccentOrb size={150} />
        </View>

        <StepShell
          stepKey="welcome"
          center
          title="Hey, glad you’re here."
          subtitle="Swipe through and see what I’ve been building — but first…"
        />

        <Pressable
          style={styles.hintTouch}
          accessibilityRole="button"
          accessibilityLabel="Continue to sign up"
          onPress={commit}
          onPressIn={() => {
            hintPress.value = withSpring(1, theme.spring.press);
          }}
          onPressOut={() => {
            hintPress.value = withSpring(0, theme.spring.press);
          }}
        >
          <Animated.View style={[styles.hint, hintBobStyle]}>
            <Text variant="overline" color="accent">
              ↑
            </Text>
            <Text variant="overline" color="textMuted">
              Swipe up
            </Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    top: '2%',
    right: -theme.spacing.xxl,
    opacity: 0.85,
  },
  hintTouch: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  hint: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});
