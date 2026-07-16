/**
 * Reads the OS "reduce motion" accessibility setting and stays subscribed to
 * changes. Consumers gate decorative/large motion behind this — durations
 * collapse toward 0 and bouncy springs swap for near-critically-damped ones,
 * while functional feedback (haptics, success text) is left untouched.
 */
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
