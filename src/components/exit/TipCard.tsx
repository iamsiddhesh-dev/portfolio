/**
 * A single tip-preset tile ($3 / $5 / $10). Premium bar: spring press +
 * haptic tick, plus an amber-highlighted selected state so the chosen amount
 * reads clearly before PaymentSheet takes over.
 */
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/Text';
import type { TipPreset } from '@/lib/tips';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TipCardProps = {
  preset: TipPreset;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function TipCard({ preset, selected, disabled, onPress }: TipCardProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: !!disabled }}
      accessibilityLabel={`${preset.label} — ${preset.blurb}`}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withSpring(1, theme.spring.press);
        haptics.selection();
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, theme.spring.press);
      }}
      style={[styles.card, selected && styles.cardSelected, disabled && styles.disabled, animatedStyle]}
    >
      <View style={styles.body}>
        <Text variant="h2" color={selected ? 'accent' : 'text'} center>
          {preset.label}
        </Text>
        <Text variant="caption" color="textSecondary" center>
          {preset.blurb}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surfaceRaised,
  },
  disabled: {
    opacity: 0.5,
  },
  body: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});
