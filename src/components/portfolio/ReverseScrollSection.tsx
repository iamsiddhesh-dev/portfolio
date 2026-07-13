/**
 * ────────────────────────────────────────────────────────────────────────────
 *  THE FLAGSHIP — mayaresearch.ai-style reverse scroll
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  Robust pin, done the RN way: the ScrollView holds an EMPTY spacer that just
 *  provides `PIN_MULTIPLIER × viewport` of scroll runway; this component is a
 *  genuinely-fixed overlay rendered as a sibling *over* the ScrollView, so it
 *  never moves — no counter-translation, no drift, no fighting the scroll. The
 *  parent measures the spacer's top (`reelTop`) and hands us the one `scrollY`
 *  shared value; we normalise `scrollY − reelTop` into a 0→1 `progress` and drive
 *  everything off it on the UI thread:
 *
 *    · overlay opacity   — feathered in/out at the runway edges, so the hero and
 *                          footer show through when the reel isn't active
 *    · the two columns   — a fixed-height band through which cards STREAM in
 *                          opposite directions (left up, right down)
 *
 *  Column travel is derived from FIXED constants (card height, band height), so
 *  there's nothing to measure and the motion is always substantial and identical
 *  across devices.
 */
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/Text';
import { CARD_GAP, CARD_HEIGHT, ProjectCard } from '@/components/portfolio/ProjectCard';
import { projects, type Project } from '@/content/projects';
import { theme } from '@/theme/theme';

/** Viewport-heights of scroll the reel consumes before releasing. Tunable. */
export const PIN_MULTIPLIER = 3;

/** The fixed "window" the cards stream through. Shorter than a column of cards,
 *  so there's always meaningful overflow (= travel) regardless of screen size. */
const BAND_HEIGHT = Math.round(CARD_HEIGHT * 1.7);

type ColumnItem =
  | { kind: 'intro' }
  | { kind: 'project'; project: Project; index: number };

const p = (index: number): ColumnItem => ({ kind: 'project', project: projects[index], index });
const LEFT_ITEMS: ColumnItem[] = [{ kind: 'intro' }, p(0), p(2)];
const RIGHT_ITEMS: ColumnItem[] = [p(1), p(3), p(4)];

// 3 tiles + 2 gaps per column (intro tile counts). Both columns match, so the
// counter-travel is symmetric.
const COLUMN_CONTENT_HEIGHT = 3 * CARD_HEIGHT + 2 * CARD_GAP;
const TRAVEL = COLUMN_CONTENT_HEIGHT - BAND_HEIGHT;

export function ReverseScrollReel({
  scrollY,
  reelTop,
  viewportHeight,
}: {
  scrollY: SharedValue<number>;
  reelTop: SharedValue<number>;
  viewportHeight: number;
}) {
  const runway = viewportHeight * (PIN_MULTIPLIER - 1); // scroll distance = full 0→1 sweep

  const progress = useDerivedValue(() =>
    interpolate(scrollY.value - reelTop.value, [0, runway], [0, 1], Extrapolation.CLAMP),
  );

  // Invisible (so hero/footer show) until the reel is on screen; feather in/out
  // at the very edges of the runway for a clean hand-off.
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.05, 0.95, 1], [0, 1, 1, 0], Extrapolation.CLAMP),
  }));

  // Left column rides UP with the scroll; right column slides DOWN against it.
  const leftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, -TRAVEL]) }],
  }));
  const rightStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(progress.value, [0, 1], [-TRAVEL, 0]) }],
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.overlay, { height: viewportHeight }, overlayStyle]}
    >
      <LinearGradient colors={theme.gradients.base} style={StyleSheet.absoluteFill} />

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

      <View style={styles.bandWrap}>
        <View style={styles.band}>
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
          {/* Feather the band's top & bottom so cards fade at the edges. */}
          <LinearGradient
            colors={[theme.colors.bg, 'transparent']}
            style={[styles.feather, styles.featherTop]}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', theme.colors.bg]}
            style={[styles.feather, styles.featherBottom]}
            pointerEvents="none"
          />
        </View>
      </View>

      <Text variant="overline" color="textMuted" style={styles.footNote}>
        Opposite directions · let them pass
      </Text>
    </Animated.View>
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
        A curated few, streaming past.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
    overflow: 'hidden',
  },
  header: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xxxl,
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
    transformOrigin: 'left center',
  },
  bandWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  band: {
    height: BAND_HEIGHT,
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  column: {
    flex: 1,
    height: BAND_HEIGHT,
    overflow: 'hidden',
  },
  stack: {
    gap: CARD_GAP,
  },
  feather: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: theme.spacing.xxl,
  },
  featherTop: {
    top: 0,
  },
  featherBottom: {
    bottom: 0,
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
  footNote: {
    paddingBottom: theme.spacing.xxl,
    textAlign: 'center',
  },
});
