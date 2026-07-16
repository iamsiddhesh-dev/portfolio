import { useState } from 'react';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CardDeck } from '@/components/portfolio/CardDeck';
import { Hero } from '@/components/portfolio/Hero';
import { MomentumScrollSection } from '@/components/portfolio/MomentumScrollSection';
import { ProjectGrid } from '@/components/portfolio/ProjectGrid';
import { PIN_MULTIPLIER, ReverseScrollReel } from '@/components/portfolio/ReverseScrollSection';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';

/**
 * ACT II — Portfolio. One `Animated.ScrollView` owns a single `scrollY` shared
 * value (captured on the UI thread via `useAnimatedScrollHandler`). The reel is a
 * FIXED overlay rendered over the scroll view; inside the scroll, an empty spacer
 * supplies its pin runway, and we measure that spacer's top (`reelTop`) so the
 * overlay knows when to activate. Hero + reel both read the one `scrollY`, zero
 * per-frame React re-renders. Phase 4's momentum section slots in where the
 * spacer is.
 */
export default function PortfolioScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { height: windowHeight } = useWindowDimensions();

  const visitorType = user?.unsafeMetadata.visitorType;
  const reason = user?.unsafeMetadata.reason;

  const scrollY = useSharedValue(0);
  const reelTop = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // The visible scroll viewport (< window height once safe areas inset). The reel
  // sizes its pin runway off this, so measure it rather than trusting the window.
  const [viewportHeight, setViewportHeight] = useState(windowHeight);
  const onScrollLayout = (e: LayoutChangeEvent) => {
    setViewportHeight(e.nativeEvent.layout.height);
  };

  // The spacer is a direct child of the scroll content, so its onLayout.y is a
  // true content offset — exactly where the reel overlay should switch on.
  const onSpacerLayout = (e: LayoutChangeEvent) => {
    reelTop.value = e.nativeEvent.layout.y;
  };

  const handleSignOut = async () => {
    haptics.medium();
    try {
      await signOut();
    } catch {
      haptics.warning();
    }
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.stage}>
        <Animated.ScrollView
          onScroll={onScroll}
          onLayout={onScrollLayout}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.padded}>
            <Hero
              scrollY={scrollY}
              viewportHeight={viewportHeight}
              visitorType={visitorType}
              reason={reason}
            />
          </View>

          {/* Empty runway for the pinned reel. The fixed overlay draws the cards. */}
          <View style={{ height: viewportHeight * PIN_MULTIPLIER }} onLayout={onSpacerLayout} />

          {/* Phase 4 — the long momentum scroll. A direct child of the scroll
              content so it can measure its own top offset (like the reel spacer). */}
          <MomentumScrollSection scrollY={scrollY} viewportHeight={viewportHeight} />

          <View style={styles.padded}>
            <ProjectGrid />
          </View>

          <CardDeck />

          <View style={[styles.padded, styles.footer]}>
            <Text variant="overline" color="textMuted">
              That’s the tour
            </Text>
            <Text variant="h2" style={styles.footerTitle}>
              One more thing
            </Text>
            <Text variant="body" color="textSecondary" style={styles.footerBody}>
              If any of this landed, there’s a coffee with my name on it. The exit’s open.
            </Text>
            <View style={styles.actions}>
              <Button label="To the exit" trailing="→" onPress={() => router.push('/exit')} />
              <Button label="Sign out" variant="secondary" onPress={handleSignOut} />
            </View>
          </View>
        </Animated.ScrollView>

        <ReverseScrollReel scrollY={scrollY} reelTop={reelTop} viewportHeight={viewportHeight} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  stage: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.huge,
  },
  padded: {
    paddingHorizontal: theme.spacing.xl,
  },
  footer: {
    paddingTop: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  footerTitle: {
    marginTop: theme.spacing.xs,
  },
  footerBody: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  actions: {
    gap: theme.spacing.md,
  },
});
