/**
 * Shared choreography for every onboarding step: fade + rise in, key changes
 * trigger Moti's built-in exit/enter crossfade so switching steps never jumps.
 */
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';

import { Text } from '@/components/Text';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { theme } from '@/theme/theme';

type StepShellProps = PropsWithChildren<{
  stepKey: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}>;

export function StepShell({ stepKey, eyebrow, title, subtitle, children }: StepShellProps) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence exitBeforeEnter>
      <MotiView
        key={stepKey}
        from={{ opacity: 0, translateY: reducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: reducedMotion ? 0 : -12 }}
        transition={{
          type: 'timing',
          duration: reducedMotion ? 0 : theme.duration.base,
          easing: theme.easing.emphasized,
        }}
        style={styles.wrap}
      >
        <View style={styles.header}>
          <Text variant="overline" color="accent">
            {eyebrow}
          </Text>
          <Text variant="h1" style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="body" color="textSecondary">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {children}
      </MotiView>
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    gap: theme.spacing.xxl,
  },
  header: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xl,
  },
  title: {
    marginTop: theme.spacing.xs,
  },
});
