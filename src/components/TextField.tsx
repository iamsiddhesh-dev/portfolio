/**
 * The app's text input. Premium bar baked in: focus ring animates via Reanimated
 * (border colour + subtle glow), haptic tick on focus, themed error state.
 */
import { forwardRef, useState } from 'react';
import { TextInput, View, StyleSheet, type TextInputProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);

  const handleFocus: NonNullable<TextInputProps['onFocus']> = (e) => {
    setFocused(true);
    focus.value = withTiming(1, theme.timing.fast);
    haptics.selection();
    onFocus?.(e);
  };
  const handleBlur: NonNullable<TextInputProps['onBlur']> = (e) => {
    setFocused(false);
    focus.value = withTiming(0, theme.timing.fast);
    onBlur?.(e);
  };

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? theme.colors.danger
      : focus.value > 0.5
        ? theme.colors.accent
        : theme.colors.hairlineStrong,
  }));

  return (
    <View style={styles.wrap}>
      <Text variant="label" color={focused ? 'accent' : 'textSecondary'} uppercase>
        {label}
      </Text>
      <Animated.View style={[styles.field, borderStyle]}>
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.textMuted}
          style={[styles.input, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
      </Animated.View>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.sm,
  },
  field: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  input: {
    minHeight: 54,
    paddingHorizontal: theme.spacing.lg,
    fontFamily: theme.fonts.bodyRegular,
    fontSize: theme.type.body.fontSize,
    color: theme.colors.text,
  },
});
