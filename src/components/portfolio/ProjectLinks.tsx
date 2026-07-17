/**
 * Renders a project's external links as tappable pills — a tinted icon + label.
 * `http(s)` links open in an in-app browser; anything else (`mailto:`, `tel:`,
 * …) goes through `Linking.openURL` instead, since `WebBrowser.openBrowserAsync`
 * only understands web URLs and silently fails on custom schemes. Built here
 * (with the icon pipeline) so Phase 5's project detail screen can drop it
 * straight in. Premium bar: haptic tick + pressed state on every pill.
 *
 * Icons are monochrome SVGs tinted to the amber accent at render, so the same
 * asset works anywhere the colour needs to change.
 */
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';

import { Text } from '@/components/Text';
import { iconSources } from '@/content/icons';
import type { ProjectLink } from '@/content/projects';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';

export function ProjectLinks({ links }: { links: ProjectLink[] }) {
  if (!links.length) return null;

  return (
    <View style={styles.row}>
      {links.map((link) => (
        <Pressable
          key={link.url}
          accessibilityRole="link"
          accessibilityLabel={link.label}
          onPress={() => {
            haptics.selection();
            if (link.url.startsWith('http')) {
              WebBrowser.openBrowserAsync(link.url);
            } else {
              Linking.openURL(link.url);
            }
          }}
          style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
        >
          <Image
            source={iconSources[link.icon]}
            style={styles.icon}
            tintColor={theme.colors.accent}
            contentFit="contain"
          />
          <Text variant="label">{link.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.hairlineStrong,
    backgroundColor: theme.colors.surfaceRaised,
  },
  pillPressed: {
    backgroundColor: theme.colors.surfaceHi,
    opacity: 0.9,
  },
  icon: {
    width: 16,
    height: 16,
  },
});
