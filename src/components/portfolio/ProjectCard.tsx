/**
 * A single project tile, sized to a FIXED height so the reverse-scroll column
 * math stays deterministic (travel = contentHeight − viewportHeight, and content
 * height must be knowable without measuring every card). Premium bar: spring
 * press + haptic tick on every card. `onPress` is optional — the reel streams
 * inert instances (no tap target, pointerEvents="none" on its wrapper); the
 * tappable grid (Phase 5) passes it to drive the shared-element morph, using
 * the forwarded ref to measure the card's on-screen frame at tap time.
 */
import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import type { Project } from '@/content/projects';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';

/** Fixed card + gap — imported by the reverse-scroll section for travel maths. */
export const CARD_HEIGHT = 208;
export const CARD_GAP = theme.spacing.lg;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ProjectCardProps = { project: Project; index: number; onPress?: () => void };

export const ProjectCard = forwardRef<View, ProjectCardProps>(function ProjectCard(
  { project, index, onPress },
  ref,
) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    borderColor: pressed.value > 0 ? theme.colors.hairlineStrong : theme.colors.hairline,
  }));

  return (
    <AnimatedPressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={`${project.name} — ${project.tagline}`}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withSpring(1, theme.spring.press);
        haptics.selection();
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, theme.spring.press);
      }}
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.topRow}>
        <Text variant="overline" color="accent">
          {String(index + 1).padStart(2, '0')}
        </Text>
        <Text variant="overline" color="textMuted">
          {project.year}
        </Text>
      </View>

      <View style={styles.body}>
        <Text variant="h3" numberOfLines={1}>
          {project.name}
        </Text>
        <Text variant="caption" color="textSecondary" numberOfLines={2}>
          {project.tagline}
        </Text>
      </View>

      <View style={styles.chips}>
        {project.stack.slice(0, 3).map((tech) => (
          <View key={tech} style={styles.chip}>
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {tech}
            </Text>
          </View>
        ))}
      </View>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    gap: theme.spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.surfaceRaised,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.md,
  },
});
