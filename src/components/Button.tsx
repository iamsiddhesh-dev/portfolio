/**
 * The app's pressable. Premium bar is baked in, not retrofitted:
 *  · press-in scale + brightness via Reanimated spring (UI thread)
 *  · haptic on press-in
 *  · three variants — primary (amber ember fill), secondary (surface), ghost
 */
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/Text';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  /** Small text/icon trailing the label, e.g. an arrow. */
  trailing?: string;
  disabled?: boolean;
  style?: ViewStyle;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  trailing,
  disabled,
  style,
}: ButtonProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.045 }],
    opacity: 1 - pressed.value * 0.12,
  }));

  const onPressIn = () => {
    pressed.value = withSpring(1, theme.spring.press);
    haptics.light();
  };
  const onPressOut = () => {
    pressed.value = withSpring(0, theme.spring.press);
  };

  const isPrimary = variant === 'primary';
  const textColor = isPrimary ? 'accentInk' : 'text';

  const inner = (
    <View style={styles.row}>
      <Text variant="bodyMed" color={textColor}>
        {label}
      </Text>
      {trailing ? (
        <Text variant="bodyMed" color={textColor} style={styles.trailing}>
          {trailing}
        </Text>
      ) : null}
    </View>
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[animatedStyle, styles.base, disabled && styles.disabled, style]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={theme.gradients.ember}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          {inner}
        </LinearGradient>
      ) : (
        <View style={[styles.fill, variant === 'secondary' ? styles.secondary : styles.ghost]}>
          {inner}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  fill: {
    minHeight: 54,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.hairlineStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.hairline,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  trailing: {
    marginTop: -1,
  },
  disabled: {
    opacity: 0.4,
  },
});
