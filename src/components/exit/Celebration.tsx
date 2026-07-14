/**
 * The success celebration — plays once, on the UI thread, when a tip clears.
 * A ring of amber embers bursts outward and fades while the AccentOrb (the
 * app's recurring "light source" motif) arrives with a bouncy overshoot,
 * reusing `theme.spring.bouncy` ("rewards, confirmations, arrivals" per its
 * own doc-comment — this is exactly that moment). Calls `onDone` once the
 * burst settles so the caller can advance to the sign-off screen.
 */
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AccentOrb } from '@/components/AccentOrb';
import { theme } from '@/theme/theme';

const PARTICLE_COUNT = 12;
const BURST_DISTANCE = 130;

export function Celebration({ onDone }: { onDone: () => void }) {
  const orbScale = useSharedValue(0);
  const burst = useSharedValue(0);

  // Kept in a ref so `handleDone` below stays referentially stable across
  // re-renders while still calling the latest `onDone` passed in.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // `runOnJS` needs a real, stable JS-thread function reference — passing it
  // an arrow function created inline *inside* the worklet below crashes
  // natively (a real on-device crash, not a JS error: Reanimated's babel
  // plugin auto-workletizes closures declared inside worklet code, so the
  // native side gets something that isn't a plain JS host function and
  // aborts on `assertion "isHostFunction(runtime)" failed`). Defining it
  // here, outside any worklet, is what keeps it a normal function.
  const handleDone = useCallback(() => {
    onDoneRef.current();
  }, []);

  useEffect(() => {
    orbScale.value = withSpring(1, theme.spring.bouncy);
    burst.value = withDelay(
      80,
      withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(handleDone)();
      }),
    );
  }, [orbScale, burst, handleDone]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
  }));

  return (
    <View style={styles.wrap} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} burst={burst} />
      ))}
      <Animated.View style={orbStyle}>
        <AccentOrb size={140} />
      </Animated.View>
    </View>
  );
}

function Particle({ index, burst }: { index: number; burst: SharedValue<number> }) {
  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;

  const style = useAnimatedStyle(() => {
    const eased = burst.value;
    return {
      transform: [
        { translateX: Math.cos(angle) * BURST_DISTANCE * eased },
        { translateY: Math.sin(angle) * BURST_DISTANCE * eased - eased * 40 },
        { scale: 1 - eased * 0.6 },
      ],
      opacity: 1 - eased,
    };
  });

  return <Animated.View style={[styles.particle, style]} />;
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -5,
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accentBright,
  },
});
