/**
 * Project detail — the destination of the shared-element morph. Renders the
 * exact same `ProjectHero` the overlay crossfades into (see `src/lib/morph.tsx`
 * for why that matters), then the description, highlights, stack, and links
 * below. `Stack.Screen` for this route disables the native transition and swipe
 * gesture (see `(portfolio)/_layout.tsx`) so the morph is the only visual
 * transition in or out — the back control always routes through `useMorph().close()`.
 */
import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { ProjectHero } from '@/components/portfolio/ProjectHero';
import { ProjectLinks } from '@/components/portfolio/ProjectLinks';
import { getProject } from '@/content/projects';
import { haptics } from '@/lib/haptics';
import { useMorph } from '@/lib/morph';
import { theme } from '@/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = getProject(id);
  const { close } = useMorph();
  const insets = useSafeAreaInsets();

  if (!project) return <ProjectNotFound onBack={close} />;

  return (
    <Screen edges={['bottom']} glow={false} contentStyle={styles.screenContent}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ProjectHero project={project} />

        <MotiView
          style={styles.body}
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: theme.duration.base, delay: 140 }}
        >
          <Text variant="body" color="textSecondary">
            {project.description}
          </Text>

          <View style={styles.section}>
            <Text variant="overline" color="accent">
              Highlights
            </Text>
            <View style={styles.highlights}>
              {project.highlights.map((h) => (
                <View key={h} style={styles.highlightRow}>
                  <Text variant="body" color="accent">
                    ·
                  </Text>
                  <Text variant="body" color="textSecondary" style={styles.highlightText}>
                    {h}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="overline" color="accent">
              Stack
            </Text>
            <View style={styles.chips}>
              {project.stack.map((tech) => (
                <View key={tech} style={styles.chip}>
                  <Text variant="caption" color="textMuted" numberOfLines={1}>
                    {tech}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ProjectLinks links={project.links} />
          </View>
        </MotiView>
      </ScrollView>

      <BackButton top={insets.top + theme.spacing.lg} onPress={close} />
    </Screen>
  );
}

function ProjectNotFound({ onBack }: { onBack: () => void }) {
  return (
    <Screen contentStyle={styles.notFound}>
      <Text variant="overline" color="accent">
        Not found
      </Text>
      <Text variant="h2" style={styles.notFoundTitle}>
        This one didn’t make it
      </Text>
      <Text variant="body" color="textSecondary" style={styles.notFoundBody}>
        That project link doesn’t match anything here.
      </Text>
      <Button label="Back to portfolio" onPress={onBack} style={styles.notFoundButton} />
    </Screen>
  );
}

function BackButton({ top, onPress }: { top: number; onPress: () => void }) {
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.08 }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      onPress={() => {
        haptics.light();
        onPress();
      }}
      onPressIn={() => {
        pressed.value = withSpring(1, theme.spring.press);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, theme.spring.press);
      }}
      style={[styles.back, { top }, animatedStyle]}
    >
      <Text variant="bodyMed">←</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 0,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: {
    marginTop: theme.spacing.xs,
  },
  notFoundBody: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  notFoundButton: {
    minWidth: 200,
  },
  scroll: {
    paddingBottom: theme.spacing.huge,
  },
  body: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  highlights: {
    gap: theme.spacing.sm,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  highlightText: {
    flex: 1,
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
  back: {
    position: 'absolute',
    left: theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.hairlineStrong,
    backgroundColor: theme.colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
