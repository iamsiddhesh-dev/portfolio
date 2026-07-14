/**
 * Gesture-physics card deck — the pattern the reel and momentum scroll can't
 * touch, since it's genuinely custom gesture-driven physics rather than
 * scroll-linked motion. Only the top card is draggable (`Gesture.Pan`,
 * horizontal-only via `activeOffsetX`/`failOffsetY` so a vertical drag falls
 * through to the enclosing ScrollView instead of fighting it): drag rotates
 * the card, release either springs it back (`withSpring`) or, past a distance
 * or velocity threshold, flings it off-screen (`withDecay`) and cycles it to
 * the bottom of the deck — infinite, haptic on every commit.
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated';
import { MotiView } from 'moti';

import { Text } from '@/components/Text';
import { factCards, type FactCard } from '@/content/factCards';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';

const VISIBLE = 3;
const SWIPE_DISTANCE_THRESHOLD = 120;
const SWIPE_VELOCITY_THRESHOLD = 800;

export function CardDeck() {
  const { width: screenWidth } = useWindowDimensions();
  const [order, setOrder] = useState<string[]>(() => factCards.map((c) => c.id));

  const commitTop = () => {
    haptics.medium();
    setOrder((prev) => [...prev.slice(1), prev[0]]);
  };

  const visibleIds = order.slice(0, VISIBLE);
  // Render back-to-front so the top card (index 0) paints last, on top.
  const renderOrder = [...visibleIds].reverse();

  return (
    <MotiView
      style={styles.root}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: theme.duration.base }}
    >
      <Text variant="overline" color="accent">
        A few extra things
      </Text>
      <Text variant="h2" style={styles.title}>
        Swipe through
      </Text>

      <View style={styles.stage}>
        {renderOrder.map((id) => {
          const card = factCards.find((c) => c.id === id)!;
          const stackIndex = visibleIds.indexOf(id); // 0 = top
          return (
            <DeckCard
              key={card.id}
              card={card}
              stackIndex={stackIndex}
              screenWidth={screenWidth}
              onCommit={stackIndex === 0 ? commitTop : undefined}
            />
          );
        })}
      </View>

      <Text variant="caption" color="textMuted" center style={styles.hint}>
        Drag a card, either direction
      </Text>
    </MotiView>
  );
}

function DeckCard({
  card,
  stackIndex,
  screenWidth,
  onCommit,
}: {
  card: FactCard;
  stackIndex: number;
  screenWidth: number;
  onCommit?: () => void;
}) {
  const isTop = stackIndex === 0;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // A springed float (not the raw prop) so promotion up the stack — after the
  // card ahead of it is dismissed — glides to its new resting spot instead of
  // snapping there.
  const restIndex = useSharedValue(stackIndex);

  useEffect(() => {
    restIndex.value = withSpring(stackIndex, theme.spring.gentle);
  }, [stackIndex, restIndex]);

  const pan = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onStart(() => {
      runOnJS(haptics.selection)();
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.4;
    })
    .onEnd((e) => {
      const shouldDismiss =
        Math.abs(e.translationX) > SWIPE_DISTANCE_THRESHOLD ||
        Math.abs(e.velocityX) > SWIPE_VELOCITY_THRESHOLD;

      if (shouldDismiss && onCommit) {
        const direction = e.translationX >= 0 ? 1 : -1;
        const flingVelocity = Math.abs(e.velocityX) > 300 ? e.velocityX : direction * 1000;
        translateX.value = withDecay({ velocity: flingVelocity, deceleration: 0.997 });
        translateY.value = withDecay({ velocity: e.velocityY, deceleration: 0.997 });
        runOnJS(onCommit)();
      } else {
        translateX.value = withSpring(0, theme.spring.snappy);
        translateY.value = withSpring(0, theme.spring.snappy);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const dragRotate = isTop
      ? interpolate(translateX.value, [-screenWidth, 0, screenWidth], [-18, 0, 18], Extrapolation.CLAMP)
      : 0;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + restIndex.value * 14 },
        { rotate: `${dragRotate}deg` },
        { scale: 1 - restIndex.value * 0.05 },
      ],
      opacity: interpolate(restIndex.value, [0, VISIBLE - 1], [1, 0.5], Extrapolation.CLAMP),
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle, { zIndex: VISIBLE - stackIndex }]}>
        <Text variant="overline" color="accent">
          {card.label}
        </Text>
        <Text variant="bodyLg" style={styles.cardText}>
          {card.text}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const STAGE_HEIGHT = 260;

const styles = StyleSheet.create({
  root: {
    paddingTop: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  stage: {
    height: STAGE_HEIGHT,
  },
  card: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: STAGE_HEIGHT - theme.spacing.xxl,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.hairlineStrong,
    backgroundColor: theme.colors.surfaceRaised,
    padding: theme.spacing.xl,
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  cardText: {
    marginTop: theme.spacing.xs,
  },
  hint: {
    marginTop: theme.spacing.lg,
  },
});
