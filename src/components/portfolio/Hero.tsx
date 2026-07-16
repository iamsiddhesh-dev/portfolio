/**
 * ACT II hero — the payoff for the auth act. It greets the visitor *by the type
 * they chose during onboarding* (recruiter / client / browsing) and echoes the
 * reason they typed, so the Clerk metadata visibly earns its place. Entrance is a
 * Moti stagger; a gentle scroll-linked parallax (driven by the shared `scrollY`)
 * sinks it away as the reel takes over.
 */
import { MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { AccentOrb } from '@/components/AccentOrb';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { theme } from '@/theme/theme';
import type { VisitorType } from '@/types/clerk';

type Copy = { greeting: string; lead: string };

const COPY: Record<VisitorType, Copy> = {
  recruiter: {
    greeting: 'Welcome, recruiter',
    lead:
      'You asked about React Native. This whole thing is the answer — real auth, real payments, 60fps motion. Not a website.',
  },
  client: {
    greeting: 'Good to see you',
    lead:
      'You’ve got something you want built. Here’s how I ship product — design through deploy, end to end.',
  },
  browsing: {
    greeting: 'Glad you’re curious',
    lead: 'No pitch. Just the work, the motion, and the details. Scroll and see what sticks.',
  },
};

const FALLBACK: Copy = { greeting: 'Welcome in', lead: 'Here’s the work. Scroll.' };

const ENTER = { opacity: 0, translateY: 16 } as const;
const SETTLE = { opacity: 1, translateY: 0 } as const;

export function Hero({
  scrollY,
  viewportHeight,
  visitorType,
  reason,
}: {
  scrollY: SharedValue<number>;
  viewportHeight: number;
  visitorType?: VisitorType;
  reason?: string;
}) {
  const copy = visitorType ? COPY[visitorType] : FALLBACK;
  const reducedMotion = useReducedMotion();
  // Entrance delays are purely decorative stagger — collapse to 0 when reduced
  // so content just appears, no motion but no missing content either.
  const delay = (ms: number) => (reducedMotion ? 0 : ms);

  // Parallax: content drifts up at 0.35× and fades over the first ~70% of a
  // viewport, so the hero recedes rather than hard-cutting into the reel.
  // Skipped entirely when reduced motion is on — the hero stays put.
  const parallax = useAnimatedStyle(() => {
    if (reducedMotion) return { opacity: 1, transform: [{ translateY: 0 }] };
    return {
      opacity: interpolate(scrollY.value, [0, viewportHeight * 0.7], [1, 0], 'clamp'),
      transform: [
        { translateY: interpolate(scrollY.value, [0, viewportHeight], [0, viewportHeight * 0.35], 'clamp') },
      ],
    };
  });

  return (
    <Animated.View style={[{ minHeight: viewportHeight * 0.92 }, styles.root, parallax]}>
      <View style={styles.orb} pointerEvents="none">
        <AccentOrb size={200} />
      </View>

      <MotiView from={ENTER} animate={SETTLE} transition={{ type: 'timing', duration: theme.duration.slow, delay: delay(60) }}>
        <Text variant="overline" color="accent">
          {copy.greeting}
        </Text>
      </MotiView>

      <MotiView from={ENTER} animate={SETTLE} transition={{ type: 'timing', duration: theme.duration.slow, delay: delay(160) }}>
        <Text variant="display" style={styles.name}>
          Siddhesh
        </Text>
      </MotiView>

      <MotiView from={ENTER} animate={SETTLE} transition={{ type: 'timing', duration: theme.duration.slow, delay: delay(280) }}>
        <Text variant="bodyLg" color="textSecondary" style={styles.lead}>
          {copy.lead}
        </Text>
      </MotiView>

      {reason ? (
        <MotiView from={ENTER} animate={SETTLE} transition={{ type: 'timing', duration: theme.duration.slow, delay: delay(400) }}>
          <Text variant="caption" color="textMuted" style={styles.reason}>
            “{reason}” — noted.
          </Text>
        </MotiView>
      ) : null}

      <MotiView
        style={styles.cue}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: theme.duration.slow, delay: delay(560) }}
      >
        <Text variant="overline" color="textMuted">
          Scroll
        </Text>
        <Text variant="overline" color="accent">
          ↓
        </Text>
      </MotiView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    justifyContent: 'center',
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  orb: {
    position: 'absolute',
    top: '4%',
    right: -theme.spacing.xxl,
    opacity: 0.9,
  },
  name: {
    marginTop: theme.spacing.xs,
  },
  lead: {
    marginTop: theme.spacing.sm,
    maxWidth: 420,
  },
  reason: {
    marginTop: theme.spacing.sm,
  },
  cue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
  },
});
