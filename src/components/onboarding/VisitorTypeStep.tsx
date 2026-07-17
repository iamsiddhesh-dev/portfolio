import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { StepShell } from '@/components/onboarding/StepShell';
import { Text } from '@/components/Text';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';
import type { VisitorType } from '@/types/clerk';

/** Also doubles as the free-text "reason" metadata Clerk stores — picking a
 * card already says why the visitor is here, so there's no separate step
 * asking them to type it again. */
export const VISITOR_OPTIONS: { value: VisitorType; label: string; hint: string }[] = [
  { value: 'recruiter', label: 'Recruiter', hint: "You're hiring or screening candidates" },
  { value: 'client', label: 'Potential client', hint: "You've got work you want built" },
  { value: 'browsing', label: 'Just browsing', hint: 'No agenda, just curious to look around' },
];

export function VisitorTypeStep({ onSelect }: { onSelect: (value: VisitorType) => void }) {
  return (
    <StepShell
      stepKey="visitor-type"
      center
      title="Who are you?"
      subtitle="Tell me why you’re here — I’ll tailor the tour."
    >
      <View>
        {VISITOR_OPTIONS.map((option, i) => (
          <VisitorCard key={option.value} index={i} option={option} onSelect={onSelect} />
        ))}
      </View>
    </StepShell>
  );
}

function VisitorCard({
  index,
  option,
  onSelect,
}: {
  index: number;
  option: (typeof VISITOR_OPTIONS)[number];
  onSelect: (value: VisitorType) => void;
}) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    borderColor: pressed.value > 0 ? theme.colors.accent : theme.colors.hairlineStrong,
  }));

  return (
    <Animated.View
      style={[styles.card, animatedStyle, { marginTop: index === 0 ? 0 : theme.spacing.md }]}
    >
      <Pressable
        style={styles.pressable}
        onPressIn={() => {
          pressed.value = withSpring(1, theme.spring.press);
          haptics.selection();
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, theme.spring.press);
        }}
        onPress={() => onSelect(option.value)}
      >
        <View style={styles.cardText}>
          <Text variant="h3">{option.label}</Text>
          <Text variant="caption" color="textSecondary">
            {option.hint}
          </Text>
        </View>
        <Text variant="h3" color="accent">
          →
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
});
