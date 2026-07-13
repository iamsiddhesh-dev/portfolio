/**
 * The Lenis-equivalent, native edition.
 *
 * On web, GSAP+Lenis feels "buttery" because Lenis intercepts the wheel and
 * *lerps* the scroll position toward its target every frame instead of jumping.
 * Native scroll already owns momentum — fling, deceleration, and boundary
 * physics are best-in-class and free — so the piece the raw `scrollY` is missing
 * is exactly that lerp: a value that eases toward the offset instead of snapping
 * to it, so everything driven off it floats a beat behind the finger.
 *
 * This reproduces precisely that: a UI-thread exponential smoother, ticked every
 * frame via `useFrameCallback`, chasing `source`. It is frame-rate independent
 * (uses the real inter-frame `dt`), so the feel is identical at 60 or 120Hz, and
 * it drives zero React re-renders — pure shared values, all on the UI thread.
 *
 * `tau` is the time constant in seconds: the value reaches ~63% of a step in
 * `tau`, ~95% in 3·tau. Bigger = more lag / floatier. ~0.12s reads as premium
 * without feeling disconnected from the finger.
 */
import { useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';

export function useSmoothFollow(source: SharedValue<number>, tau = 0.12): SharedValue<number> {
  const smooth = useSharedValue(0);

  useFrameCallback((frame) => {
    'worklet';
    const diff = source.value - smooth.value;
    // At rest, settle exactly once and stop writing — otherwise every dependent
    // derived value / animated style would recompute every frame forever.
    if (Math.abs(diff) < 0.05) {
      if (smooth.value !== source.value) smooth.value = source.value;
      return;
    }
    // First frame has no previous; assume a nominal 60Hz step.
    const dt = (frame.timeSincePreviousFrame ?? 16) / 1000;
    const k = 1 - Math.exp(-dt / tau); // 0→1 blend factor for this frame
    smooth.value += diff * k;
  });

  return smooth;
}
