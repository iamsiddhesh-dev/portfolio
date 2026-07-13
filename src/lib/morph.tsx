/**
 * Shared-element morph — manual overlay technique (not Reanimated's experimental
 * shared-transition API, which is flaky with Expo Router). Three independent
 * layers, all driven by the same `progress`/`contentMix` timeline:
 *
 *   1. `frame`     — a plain colour block using the FLIP technique: a
 *                    full-screen base view, transformed (scale + translate) to
 *                    *look* like the small card, then animated to identity.
 *                    No text lives inside it, so nothing gets stretched by the
 *                    non-uniform scale.
 *   2. mini card   — the small card's text, absolutely pinned at the ACTUAL
 *                    measured origin rect (unscaled, so it stays crisp),
 *                    fading out early in the timeline.
 *   3. hero        — the real detail screen's header content (literally the
 *                    same `ProjectHero` component the real route renders),
 *                    fading in as the frame finishes growing.
 *
 * The real detail route is pushed the instant the morph starts and sits
 * underneath, already laid out — once the crossfade completes the whole
 * overlay fades to fully invisible, revealing the (pixel-identical) real
 * screen with no jump.
 *
 * Mounted once in `(portfolio)/_layout.tsx`, above the Stack, so it can draw
 * over both the grid screen and the detail screen regardless of navigation.
 */
import { createContext, useContext, useRef, useState, type PropsWithChildren } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ProjectHero } from '@/components/portfolio/ProjectHero';
import { Text } from '@/components/Text';
import type { Project } from '@/content/projects';
import { theme } from '@/theme/theme';

export type Frame = { x: number; y: number; width: number; height: number };

const ZERO_FRAME: Frame = { x: 0, y: 0, width: 1, height: 1 };

type MorphContextValue = {
  /** Begin the open morph from a measured card frame. */
  open: (project: Project, frame: Frame) => void;
  /** Begin the close morph, reversing back to the stored origin frame. */
  close: () => void;
};

const MorphContext = createContext<MorphContextValue | null>(null);

export function useMorph() {
  const ctx = useContext(MorphContext);
  if (!ctx) throw new Error('useMorph must be used within a MorphProvider');
  return ctx;
}

export function MorphProvider({
  children,
  onNavigateOpen,
  onNavigateClose,
}: PropsWithChildren<{
  onNavigateOpen: (project: Project) => void;
  onNavigateClose: () => void;
}>) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [project, setProject] = useState<Project | null>(null);
  const originRef = useRef<Frame>(ZERO_FRAME);

  const progress = useSharedValue(0); // 0 = card frame, 1 = full screen
  const contentMix = useSharedValue(0); // 0 = mini card content, 1 = full hero content
  // Decoupled from `progress` so the overlay can sit fully-open-but-INVISIBLE
  // once the crossfade settles (letting the real, pixel-identical screen
  // underneath take over) without losing the frame math `close()` needs.
  const visible = useSharedValue(0);

  const finishClose = () => {
    setProject(null);
    onNavigateClose();
  };

  const open = (nextProject: Project, frame: Frame) => {
    originRef.current = frame;
    setProject(nextProject);
    progress.value = 0;
    contentMix.value = 0;
    visible.value = 1;
    progress.value = withTiming(
      1,
      { duration: theme.duration.slow, easing: theme.easing.emphasizedDecel },
      (finished) => {
        if (finished) {
          visible.value = withTiming(0, { duration: theme.duration.fast, easing: theme.easing.standard });
        }
      },
    );
    contentMix.value = withTiming(1, { duration: theme.duration.base, easing: theme.easing.standard });
    onNavigateOpen(nextProject);
  };

  const close = () => {
    visible.value = 1;
    progress.value = withTiming(
      0,
      { duration: theme.duration.base, easing: theme.easing.emphasizedAccel },
      (finished) => {
        if (finished) runOnJS(finishClose)();
      },
    );
    contentMix.value = withTiming(0, { duration: theme.duration.base, easing: theme.easing.standard });
  };

  const containerStyle = useAnimatedStyle(() => ({ opacity: visible.value }));

  const frameStyle = useAnimatedStyle(() => {
    const origin = originRef.current;
    const fullCx = screenWidth / 2;
    const fullCy = screenHeight / 2;
    const originCx = origin.x + origin.width / 2;
    const originCy = origin.y + origin.height / 2;

    const scaleX = interpolate(progress.value, [0, 1], [origin.width / screenWidth, 1], Extrapolation.CLAMP);
    const scaleY = interpolate(progress.value, [0, 1], [origin.height / screenHeight, 1], Extrapolation.CLAMP);
    const translateX = interpolate(progress.value, [0, 1], [originCx - fullCx, 0], Extrapolation.CLAMP);
    const translateY = interpolate(progress.value, [0, 1], [originCy - fullCy, 0], Extrapolation.CLAMP);

    return {
      backgroundColor: interpolateColor(progress.value, [0, 1], [theme.colors.surfaceRaised, theme.colors.bg]),
      borderRadius: interpolate(progress.value, [0, 1], [theme.radius.lg, 0], Extrapolation.CLAMP),
      transform: [{ translateX }, { translateY }, { scaleX }, { scaleY }],
    };
  });

  // Pinned at the real measured card rect — never scaled, so its text stays
  // crisp while it simply fades out early in the timeline.
  const miniCardStyle = useAnimatedStyle(() => {
    const origin = originRef.current;
    return {
      left: origin.x,
      top: origin.y,
      width: origin.width,
      height: origin.height,
      opacity: interpolate(contentMix.value, [0, 0.35], [1, 0], Extrapolation.CLAMP),
    };
  });

  const heroContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(contentMix.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <MorphContext.Provider value={{ open, close }}>
      {children}

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.overlay, containerStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, frameStyle]} />

        {project ? (
          <>
            <Animated.View style={[styles.miniCard, miniCardStyle]}>
              <Text variant="overline" color="accent">
                {project.year}
              </Text>
              <Text variant="h3" numberOfLines={1}>
                {project.name}
              </Text>
              <Text variant="caption" color="textSecondary" numberOfLines={2}>
                {project.tagline}
              </Text>
            </Animated.View>

            <Animated.View style={[StyleSheet.absoluteFill, heroContentStyle]}>
              <ProjectHero project={project} />
            </Animated.View>
          </>
        ) : null}
      </Animated.View>
    </MorphContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 50,
    elevation: 50,
  },
  miniCard: {
    position: 'absolute',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
});
