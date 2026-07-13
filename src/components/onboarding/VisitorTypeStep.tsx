import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { StepShell } from '@/components/onboarding/StepShell';
import { Text } from '@/components/Text';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';
import type { VisitorType } from '@/types/clerk';

const OPTIONS: { value: VisitorType; label: string; hint: string }[] = [
  { value: 'recruiter', label: 'Recruiter', hint: "I'm hiring or screening candidates" },
  { value: 'client', label: 'Potential client', hint: 'I have work I want built' },
  { value: 'browsing', label: 'Just browsing', hint: 'Curious to see what this is' },
];

export function VisitorTypeStep({ onSelect }: { onSelect: (value: VisitorType) => void }) {
  return (
    <StepShell
      stepKey="visitor-type"
      eyebrow="Step 2 of 3"
      title="Who are you?"
      subtitle="This shapes what you see next."
    >
      <View style={styles.list}>
        {OPTIONS.map((option, i) => (
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
  option: (typeof OPTIONS)[number];
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
  list: {
    flex: 1,
  },
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
