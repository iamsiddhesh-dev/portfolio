/**
 * Shared choreography for every onboarding step: fade + rise in, key changes
 * trigger Moti's built-in exit/enter crossfade so switching steps never jumps.
 * Optionally, the whole step (header + form, riding together as one card) can
 * be swiped down to go back, mirroring the welcome screen's swipe-up-to-continue.
 */
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AnimatePresence, MotiView } from 'moti';

import { Text } from '@/components/Text';
import { haptics } from '@/lib/haptics';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { theme } from '@/theme/theme';

const SWIPE_BACK_DISTANCE_THRESHOLD = 60;
const SWIPE_BACK_VELOCITY_THRESHOLD = 450;
const SWIPE_BACK_FLING_DISTANCE = 300;

type StepShellProps = PropsWithChildren<{
  stepKey: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Centers the header vertically instead of pinning it to the top — for
   * title-card moments (welcome) rather than form steps. */
  center?: boolean;
  /** Swipe the whole step down to go back. */
  onSwipeBack?: () => void;
}>;

export function StepShell({
  stepKey,
  eyebrow,
  title,
  subtitle,
  center,
  onSwipeBack,
  children,
}: StepShellProps) {
  const reducedMotion = useReducedMotion();
  const dragY = useSharedValue(0);

  const commitBack = () => {
    haptics.medium();
    onSwipeBack?.();
  };

  const backGesture = Gesture.Pan()
    .enabled(!!onSwipeBack)
    .activeOffsetY([-1000, 12])
    .failOffsetX([-16, 16])
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      const shouldCommit =
        e.translationY > SWIPE_BACK_DISTANCE_THRESHOLD || e.velocityY > SWIPE_BACK_VELOCITY_THRESHOLD;
      if (shouldCommit) {
        dragY.value = withTiming(SWIPE_BACK_FLING_DISTANCE, {
          duration: reducedMotion ? 0 : theme.duration.base,
          easing: theme.easing.emphasizedAccel,
        });
        runOnJS(commitBack)();
      } else {
        dragY.value = withSpring(0, theme.spring.gentle);
      }
    });

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragY.value }],
  }));

  const content = (
    <Animated.View style={[styles.dragArea, center && styles.dragAreaCenter, onSwipeBack && dragStyle]}>
      <View style={styles.header}>
        {eyebrow ? (
          <Text variant="overline" color="accent">
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="h1" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body" color="textSecondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </Animated.View>
  );

  return (
    <AnimatePresence exitBeforeEnter>
      <MotiView
        key={stepKey}
        from={{ opacity: 0, translateY: reducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: reducedMotion ? 0 : -12 }}
        transition={{
          type: 'timing',
          duration: reducedMotion ? 0 : theme.duration.base,
          easing: theme.easing.emphasized,
        }}
        style={styles.wrap}
      >
        {onSwipeBack ? <GestureDetector gesture={backGesture}>{content}</GestureDetector> : content}
      </MotiView>
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  // Always flex:1 (never conditional) — this is the step's gesture surface,
  // so it must always cover the full screen regardless of `center`. Centering
  // is layered on top via justifyContent, not by removing the flex fill —
  // shrinking this to fit-content previously left the swipe area covering
  // only the text instead of the whole screen. Keep it this way.
  dragArea: {
    flex: 1,
    gap: theme.spacing.xxl,
  },
  dragAreaCenter: {
    justifyContent: 'center',
  },
  header: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xl,
  },
  title: {
    marginTop: theme.spacing.xs,
  },
});
