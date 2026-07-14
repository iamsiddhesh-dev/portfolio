/**
 * The detail screen's header block — pulled out so the morph overlay's "hero"
 * crossfade layer (`src/lib/morph.tsx`) and the real detail route
 * (`src/app/(portfolio)/project/[id].tsx`) render the *exact same component*.
 * That's what makes the overlay's fade-out into the real screen invisible: if
 * they ever drifted apart pixel-wise, the morph would show a jump at the
 * handoff. Reads the top safe-area inset itself (rather than relying on a
 * SafeAreaView) so it matches whether it's sitting inside the full-screen
 * overlay or the real screen.
 */
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import type { Project } from '@/content/projects';
import { theme } from '@/theme/theme';

export function ProjectHero({ project }: { project: Project }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + theme.spacing.xxxl }]}>
      <View style={styles.metaRow}>
        <Text variant="overline" color="accent">
          {project.role}
        </Text>
        <Text variant="overline" color="textMuted">
          {project.year}
        </Text>
      </View>
      <Text variant="h1" style={styles.name}>
        {project.name}
      </Text>
      <Text variant="bodyLg" color="textSecondary" style={styles.tagline}>
        {project.tagline}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    marginTop: theme.spacing.xs,
  },
  tagline: {
    maxWidth: 480,
  },
});
