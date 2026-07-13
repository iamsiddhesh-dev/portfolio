/**
 * ────────────────────────────────────────────────────────────────────────────
 *  PHASE 4 — the long scroll (the Lenis equivalent, rebuilt on the UI thread)
 * ────────────────────────────────────────────────────────────────────────────
 *
 *  Native scroll already owns momentum — fling, deceleration and boundary feel
 *  are best-in-class and free. What web's GSAP+Lenis adds, and what raw
 *  `scrollY` lacks, is the *lag*: a smoothed value that eases toward the offset
 *  so scene animations float a beat behind the finger. We keep the native
 *  ScrollView (this section is just tall content inside the one act-wide scroll)
 *  and derive that lag with `useSmoothFollow` — a UI-thread lerp of `scrollY`.
 *  Everything below is driven off that single `smooth` value; zero per-frame
 *  React re-renders (even the counting numbers animate via `useAnimatedProps`
 *  on a TextInput, never React state).
 *
 *  Layout: a short chapter header, then THREE full-viewport "scenes" stacked in
 *  normal scroll flow — skills · stats · timeline. Each scene knows its own
 *  content offset (`panelOffset`) and, with the measured `sectionTop`, computes
 *  a local `enter` (0→1 as it rises into place) plus a signed `rel` for parallax
 *  — all in worklets, nothing measured per element.
 */
import { StyleSheet, TextInput, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { milestones, skills, stats, type Milestone, type Stat } from '@/content/journey';
import { useSmoothFollow } from '@/lib/useSmoothFollow';
import { theme } from '@/theme/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/** Chapter header height, as a fraction of the viewport. */
const HEADER_FACTOR = 0.55;

/* ── Shared per-scene progress ──
 * `enter` — 0→1 as the panel rises into its resting position (drives reveals).
 * `rel`   — signed distance-from-centred in viewport units (drives parallax). */
function useSceneProgress(
  smooth: SharedValue<number>,
  sectionTop: SharedValue<number>,
  panelOffset: number,
  vh: number,
) {
  const enter = useDerivedValue(() => {
    const p = sectionTop.value + panelOffset;
    return interpolate(smooth.value, [p - vh * 0.72, p - vh * 0.08], [0, 1], Extrapolation.CLAMP);
  });
  const rel = useDerivedValue(() => {
    const p = sectionTop.value + panelOffset;
    return (smooth.value - p) / vh;
  });
  return { enter, rel };
}

export function MomentumScrollSection({
  scrollY,
  viewportHeight: vh,
}: {
  scrollY: SharedValue<number>;
  viewportHeight: number;
}) {
  // The Lenis lag. Native scroll keeps its momentum; this is what the scenes ride.
  const smooth = useSmoothFollow(scrollY);

  // Section top as a content offset. This View is a direct child of the scroll
  // content container (see portfolio.tsx), so `layout.y` is a true offset — the
  // same rule the reel relies on. Wrapping this in another View would zero it.
  const sectionTop = useSharedValue(0);
  const onLayout = (e: LayoutChangeEvent) => {
    sectionTop.value = e.nativeEvent.layout.y;
  };

  const headerH = vh * HEADER_FACTOR;

  return (
    <View onLayout={onLayout}>
      <ChapterHeader smooth={smooth} sectionTop={sectionTop} height={headerH} vh={vh} />
      <SkillsScene smooth={smooth} sectionTop={sectionTop} panelOffset={headerH} vh={vh} />
      <StatsScene smooth={smooth} sectionTop={sectionTop} panelOffset={headerH + vh} vh={vh} />
      <TimelineScene smooth={smooth} sectionTop={sectionTop} panelOffset={headerH + vh * 2} vh={vh} />
    </View>
  );
}

/* ── Chapter opener ─────────────────────────────────────────────────────── */

function ChapterHeader({
  smooth,
  sectionTop,
  height,
  vh,
}: {
  smooth: SharedValue<number>;
  sectionTop: SharedValue<number>;
  height: number;
  vh: number;
}) {
  const style = useAnimatedStyle(() => {
    const local = smooth.value - sectionTop.value; // 0 at the section's top edge
    return {
      opacity: interpolate(local, [-vh * 0.4, -vh * 0.05, height * 0.9], [0, 1, 0.12], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(local, [-vh * 0.4, height], [24, -24], Extrapolation.CLAMP) }],
    };
  });

  return (
    <View style={[styles.header, { height }]}>
      <Animated.View style={style}>
        <Text variant="overline" color="accent">
          The long scroll
        </Text>
        <Text variant="h1" style={styles.headerTitle}>
          Momentum, smoothed
        </Text>
        <Text variant="bodyLg" color="textSecondary" style={styles.headerLead}>
          Everything from here floats a beat behind your finger — native fling, eased on the UI thread.
        </Text>
      </Animated.View>
    </View>
  );
}

/* ── Scene 1 — skills ───────────────────────────────────────────────────── */

function SkillsScene({
  smooth,
  sectionTop,
  panelOffset,
  vh,
}: {
  smooth: SharedValue<number>;
  sectionTop: SharedValue<number>;
  panelOffset: number;
  vh: number;
}) {
  const { enter, rel } = useSceneProgress(smooth, sectionTop, panelOffset, vh);

  return (
    <View style={[styles.panel, { height: vh }]}>
      <GhostWord word="STACK" enter={enter} rel={rel} />
      <View style={styles.sceneBody}>
        <Text variant="overline" color="textMuted">
          What I reach for
        </Text>
        <View style={styles.skillList}>
          {skills.map((skill, i) => (
            <SkillRow key={skill.label} skill={skill} enter={enter} index={i} total={skills.length} />
          ))}
        </View>
      </View>
    </View>
  );
}

function SkillRow({
  skill,
  enter,
  index,
  total,
}: {
  skill: { label: string; note: string };
  enter: SharedValue<number>;
  index: number;
  total: number;
}) {
  const style = useAnimatedStyle(() => {
    const start = (index / total) * 0.55;
    const t = interpolate(enter.value, [start, start + 0.4], [0, 1], Extrapolation.CLAMP);
    const dir = index % 2 === 0 ? -1 : 1;
    return {
      opacity: t,
      transform: [{ translateX: (1 - t) * 30 * dir }, { translateY: (1 - t) * 10 }],
    };
  });

  return (
    <Animated.View style={[styles.skillRow, style]}>
      <Text variant="h3">{skill.label}</Text>
      <Text variant="caption" color="textMuted">
        {skill.note}
      </Text>
    </Animated.View>
  );
}

/* ── Scene 2 — stats ────────────────────────────────────────────────────── */

function StatsScene({
  smooth,
  sectionTop,
  panelOffset,
  vh,
}: {
  smooth: SharedValue<number>;
  sectionTop: SharedValue<number>;
  panelOffset: number;
  vh: number;
}) {
  const { enter, rel } = useSceneProgress(smooth, sectionTop, panelOffset, vh);

  return (
    <View style={[styles.panel, { height: vh }]}>
      <GhostWord word="COUNT" enter={enter} rel={rel} />
      <View style={styles.sceneBody}>
        <Text variant="overline" color="textMuted">
          By the numbers
        </Text>
        <View style={styles.statGrid}>
          {stats.map((stat, i) => (
            <StatTile key={stat.label} stat={stat} enter={enter} index={i} total={stats.length} />
          ))}
        </View>
      </View>
    </View>
  );
}

function StatTile({
  stat,
  enter,
  index,
  total,
}: {
  stat: Stat;
  enter: SharedValue<number>;
  index: number;
  total: number;
}) {
  const start = (index / total) * 0.4;
  const suffix = stat.suffix ?? '';

  // Count-up runs on the UI thread — the TextInput's text is set via animatedProps,
  // so the number ticks without a single React re-render.
  const animatedProps = useAnimatedProps(() => {
    const t = interpolate(enter.value, [start, start + 0.55], [0, 1], Extrapolation.CLAMP);
    const eased = t * t * (3 - 2 * t); // smoothstep
    return { text: `${Math.round(stat.value * eased)}${suffix}` } as never;
  });

  const tileStyle = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [start, start + 0.3], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: (1 - interpolate(enter.value, [start, start + 0.4], [0, 1], Extrapolation.CLAMP)) * 20 },
    ],
  }));

  return (
    <Animated.View style={[styles.statTile, tileStyle]}>
      <AnimatedTextInput
        editable={false}
        pointerEvents="none"
        underlineColorAndroid="transparent"
        defaultValue={`0${suffix}`}
        animatedProps={animatedProps}
        style={styles.statNumber}
      />
      <Text variant="label" color="textSecondary">
        {stat.label}
      </Text>
    </Animated.View>
  );
}

/* ── Scene 3 — timeline ─────────────────────────────────────────────────── */

function TimelineScene({
  smooth,
  sectionTop,
  panelOffset,
  vh,
}: {
  smooth: SharedValue<number>;
  sectionTop: SharedValue<number>;
  panelOffset: number;
  vh: number;
}) {
  const { enter, rel } = useSceneProgress(smooth, sectionTop, panelOffset, vh);

  // The rail's accent fill draws downward as the scene enters.
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: interpolate(enter.value, [0.05, 0.95], [0, 1], Extrapolation.CLAMP) }],
  }));

  return (
    <View style={[styles.panel, { height: vh }]}>
      <GhostWord word="PATH" enter={enter} rel={rel} />
      <View style={styles.sceneBody}>
        <Text variant="overline" color="textMuted">
          The path so far
        </Text>
        <View style={styles.timeline}>
          <View style={styles.rail}>
            <Animated.View style={[styles.railFill, fillStyle]} />
          </View>
          {milestones.map((m, i) => (
            <MilestoneRow key={m.title} milestone={m} enter={enter} index={i} total={milestones.length} />
          ))}
        </View>
      </View>
    </View>
  );
}

function MilestoneRow({
  milestone,
  enter,
  index,
  total,
}: {
  milestone: Milestone;
  enter: SharedValue<number>;
  index: number;
  total: number;
}) {
  const start = 0.1 + (index / total) * 0.7;

  const rowStyle = useAnimatedStyle(() => {
    const t = interpolate(enter.value, [start, start + 0.3], [0, 1], Extrapolation.CLAMP);
    return { opacity: t, transform: [{ translateX: (1 - t) * 22 }] };
  });
  const dotStyle = useAnimatedStyle(() => {
    const t = interpolate(enter.value, [start, start + 0.18], [0, 1], Extrapolation.CLAMP);
    return { opacity: 0.3 + t * 0.7, transform: [{ scale: 0.4 + t * 0.6 }] };
  });

  return (
    <Animated.View style={[styles.milestone, rowStyle]}>
      <View style={styles.dotCol}>
        <Animated.View style={[styles.dot, dotStyle]} />
      </View>
      <View style={styles.milestoneBody}>
        <Text variant="h3" color="accent">
          {milestone.title}
        </Text>
        <Text variant="body" color="textSecondary">
          {milestone.detail}
        </Text>
      </View>
    </Animated.View>
  );
}

/* ── Shared decorative ghost watermark (parallaxes behind each scene) ─────── */

function GhostWord({
  word,
  enter,
  rel,
}: {
  word: string;
  enter: SharedValue<number>;
  rel: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0, 1], [0.015, 0.06], Extrapolation.CLAMP),
    // Scale via transform (not a raw font size) keeps us on the type scale, and
    // the parallax drift makes it read as a layer behind the content.
    transform: [{ translateY: rel.value * -70 }, { scale: 2.3 }],
  }));

  return (
    <Animated.View style={styles.ghost} pointerEvents="none">
      <Animated.Text style={[styles.ghostText, style]}>{word}</Animated.Text>
    </Animated.View>
  );
}

const DOT_COL = 28;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing.xxl,
  },
  headerTitle: {
    marginTop: theme.spacing.sm,
  },
  headerLead: {
    marginTop: theme.spacing.md,
    maxWidth: 460,
  },
  panel: {
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sceneBody: {
    gap: theme.spacing.lg,
  },
  ghost: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    fontFamily: theme.type.display.fontFamily,
    fontSize: theme.type.display.fontSize,
    letterSpacing: theme.type.display.letterSpacing,
    color: theme.colors.text,
  },
  // Skills
  skillList: {
    gap: theme.spacing.xs,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
  },
  // Stats
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.spacing.xl,
    columnGap: theme.spacing.md,
  },
  statTile: {
    width: '47%',
    gap: theme.spacing.xs,
  },
  statNumber: {
    fontFamily: theme.type.h1.fontFamily,
    fontSize: theme.type.h1.fontSize,
    lineHeight: theme.type.h1.lineHeight,
    letterSpacing: theme.type.h1.letterSpacing,
    color: theme.colors.accent,
    padding: 0,
    margin: 0,
  },
  // Timeline
  timeline: {
    position: 'relative',
    gap: theme.spacing.xl,
    paddingTop: theme.spacing.xs,
  },
  rail: {
    position: 'absolute',
    top: theme.spacing.sm,
    bottom: theme.spacing.sm,
    left: DOT_COL / 2 - 1,
    width: 2,
    backgroundColor: theme.colors.hairlineStrong,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  railFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    transformOrigin: 'top',
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  dotCol: {
    width: DOT_COL,
    alignItems: 'center',
    paddingTop: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
  },
  milestoneBody: {
    flex: 1,
    gap: 2,
  },
});
