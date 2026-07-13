/**
 * ────────────────────────────────────────────────────────────────────────────
 *  THE FLAGSHIP — mayaresearch.ai-style reverse scroll
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  A pinned section: it reserves PIN_MULTIPLIER × viewport of *scroll length*,
 *  but visually stays fixed on screen for that whole runway while its two card
 *  columns travel in OPPOSITE directions — left rides up with the scroll, right
 *  slides down against it. All of it runs on the UI thread: the parent hands us
 *  one `scrollY` shared value, we normalise it to a 0→1 `progress`, and every
 *  moving part reads that through `useAnimatedStyle` — zero per-frame React
 *  re-renders.
 *
 *  Pinning is done by hand (no sticky positioning in RN ScrollView): the frame
 *  is absolutely placed at the section's top and translated *down* by exactly
 *  how far we've scrolled past that top — cancelling the scroll so it appears
 *  frozen — clamped to the runway so it releases cleanly at both ends.
 */
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { CARD_GAP, CARD_HEIGHT, ProjectCard } from '@/components/portfolio/ProjectCard';
import { projects, type Project } from '@/content/projects';
import { theme } from '@/theme/theme';

/** How many viewport-heights of scroll the pinned section consumes. Tunable. */
export const PIN_MULTIPLIER = 3;

type ColumnItem =
  | { kind: 'intro' }
  | { kind: 'project'; project: Project; index: number };

// Roster split across the two counter-moving columns. Both columns hold three
// tiles so their content heights match and the counter-travel stays symmetric.
const p = (index: number): ColumnItem => ({ kind: 'project', project: projects[index], index });
const LEFT_ITEMS: ColumnItem[] = [{ kind: 'intro' }, p(0), p(2)];
const RIGHT_ITEMS: ColumnItem[] = [p(1), p(3), p(4)];

/** Deterministic column content height — 3 tiles + 2 gaps (intro tile counts). */
const COLUMN_CONTENT_HEIGHT = 3 * CARD_HEIGHT + 2 * CARD_GAP;

export function ReverseScrollSection({
  scrollY,
  viewportHeight,
}: {
  scrollY: SharedValue<number>;
  viewportHeight: number;
}) {
  const sectionTop = useSharedValue(0);
  const columnViewport = useSharedValue(0);

  const sectionHeight = viewportHeight * PIN_MULTIPLIER;
  const runway = sectionHeight - viewportHeight; // scroll distance spent pinned

  const onSectionLayout = (e: LayoutChangeEvent) => {
    sectionTop.value = e.nativeEvent.layout.y;
  };
  const onColumnsLayout = (e: LayoutChangeEvent) => {
    columnViewport.value = e.nativeEvent.layout.height;
  };

  // 0 before the section reaches the top of the viewport, 1 once fully scrolled
  // through the runway. Clamped so the ends are crisp, not mushy.
  const progress = useDerivedValue(() =>
    interpolate(scrollY.value - sectionTop.value, [0, runway], [0, 1], Extrapolation.CLAMP),
  );

  // Hand-rolled pinning: translate the frame down by how far we've scrolled past
  // the section top, capped at the runway so it latches on entry and releases on exit.
  const frameStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value - sectionTop.value,
          [0, runway],
          [0, runway],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  // Left column rides UP with the scroll; right column slides DOWN against it.
  const leftStyle = useAnimatedStyle(() => {
    const travel = Math.max(0, COLUMN_CONTENT_HEIGHT - columnViewport.value);
    return { transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -travel]) }] };
  });
  const rightStyle = useAnimatedStyle(() => {
    const travel = Math.max(0, COLUMN_CONTENT_HEIGHT - columnViewport.value);
    return { transform: [{ translateY: interpolate(progress.value, [0, 1], [-travel, 0]) }] };
  });

  const progressBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <View style={{ height: sectionHeight }} onLayout={onSectionLayout}>
      <Animated.View style={[styles.frame, { height: viewportHeight }, frameStyle]}>
        <View style={styles.header}>
          <Text variant="overline" color="accent">
            The reel
          </Text>
          <Text variant="caption" color="textMuted">
            Five builds, one throughline — keep scrolling
          </Text>
          <View style={styles.track}>
            <Animated.View style={[styles.trackFill, progressBarStyle]} />
          </View>
        </View>

        <View style={styles.columns} onLayout={onColumnsLayout}>
          <View style={styles.column}>
            <Animated.View style={[styles.stack, leftStyle]}>
              {LEFT_ITEMS.map((item, i) => (
                <Cell key={cellKey(item, i)} item={item} />
              ))}
            </Animated.View>
          </View>
          <View style={styles.column}>
            <Animated.View style={[styles.stack, rightStyle]}>
              {RIGHT_ITEMS.map((item, i) => (
                <Cell key={cellKey(item, i)} item={item} />
              ))}
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function cellKey(item: ColumnItem, i: number) {
  return item.kind === 'intro' ? `intro-${i}` : item.project.id;
}

function Cell({ item }: { item: ColumnItem }) {
  if (item.kind === 'intro') return <IntroCard />;
  return <ProjectCard project={item.project} index={item.index} />;
}

/** Editorial lead tile that opens the left column — keeps both columns 3-tall. */
function IntroCard() {
  return (
    <View style={styles.introCard}>
      <Text variant="overline" color="textMuted">
        Selected work
      </Text>
      <Text variant="h2" style={styles.introTitle}>
        Things I&apos;ve shipped
      </Text>
      <Text variant="caption" color="textSecondary">
        Two columns, moving opposite ways. Let them pass.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  track: {
    height: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.hairline,
    overflow: 'hidden',
    marginTop: theme.spacing.xs,
  },
  trackFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    // scaleX grows the fill from the left edge, reading as a progress meter.
    transformOrigin: 'left center',
  },
  columns: {
    flex: 1,
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  column: {
    flex: 1,
    overflow: 'hidden',
  },
  stack: {
    gap: CARD_GAP,
  },
  introCard: {
    height: CARD_HEIGHT,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairlineStrong,
    backgroundColor: theme.colors.surfaceRaised,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  introTitle: {
    marginBottom: theme.spacing.xs,
  },
});
