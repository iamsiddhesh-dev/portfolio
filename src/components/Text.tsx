/**
 * The only text primitive in the app. Enforces the type scale + warm palette so
 * a raw <Text> with a system font can never sneak in.
 *
 *   <Text variant="display">Siddhesh</Text>
 *   <Text variant="body" color="textSecondary">…</Text>
 */
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { theme, type TypeVariant } from '@/theme/theme';

type ColorToken = keyof typeof theme.colors;

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: ColorToken;
  /** Convenience for all-caps eyebrows without touching content. */
  uppercase?: boolean;
  center?: boolean;
};

export function Text({
  variant = 'body',
  color = 'text',
  uppercase,
  center,
  style,
  ...rest
}: TextProps) {
  const base = theme.type[variant];
  const composed: TextStyle = {
    fontFamily: base.fontFamily,
    fontSize: base.fontSize,
    lineHeight: base.lineHeight,
    letterSpacing: base.letterSpacing,
    color: theme.colors[color],
    ...(uppercase ? { textTransform: 'uppercase' } : null),
    ...(center ? { textAlign: 'center' } : null),
  };
  return <RNText {...rest} style={[composed, style]} />;
}
