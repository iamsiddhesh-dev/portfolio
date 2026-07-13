import { useState } from 'react';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { StyleSheet, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Hero } from '@/components/portfolio/Hero';
import { ReverseScrollSection } from '@/components/portfolio/ReverseScrollSection';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';

/**
 * ACT II — Portfolio. One `Animated.ScrollView` owns a single `scrollY` shared
 * value (captured on the UI thread via `useAnimatedScrollHandler`); the hero and
 * the reverse-scroll reel both read it, so the whole act is choreographed off one
 * source of scroll with zero per-frame React re-renders. Phase 4 slots its
 * momentum-scroll section between the reel and the footer.
 */
export default function PortfolioScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { height: windowHeight } = useWindowDimensions();

  const visitorType = user?.unsafeMetadata.visitorType;
  const reason = user?.unsafeMetadata.reason;

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  // The visible scroll viewport (< window height once safe areas are inset). The
  // reverse-scroll section sizes its pinned runway off this, so measure it for
  // real rather than trusting the window height.
  const [viewportHeight, setViewportHeight] = useState(windowHeight);
  const onScrollLayout = (e: LayoutChangeEvent) => {
    setViewportHeight(e.nativeEvent.layout.height);
  };

  const handleSignOut = async () => {
    haptics.medium();
    await signOut();
  };

  return (
    <Screen contentStyle={styles.screen}>
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

        {/* Direct child of the scroll content on purpose: the section measures
            its own top via onLayout, and onLayout.y is relative to the parent —
            so it must sit directly under the content container to read a true
            content offset. It pads its own frame instead of leaning on a wrapper. */}
        <ReverseScrollSection scrollY={scrollY} viewportHeight={viewportHeight} />

        <View style={[styles.padded, styles.footer]}>
          <Text variant="overline" color="textMuted">
            Next
          </Text>
          <Text variant="h2" style={styles.footerTitle}>
            The long scroll
          </Text>
          <Text variant="body" color="textSecondary" style={styles.footerBody}>
            A momentum-smoothed journey lands here in the next pass. For now, the exit’s open.
          </Text>
          <View style={styles.actions}>
            <Button label="To the exit" trailing="→" onPress={() => router.push('/exit')} />
            <Button label="Sign out" variant="secondary" onPress={handleSignOut} />
          </View>
        </View>
      </Animated.ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
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
