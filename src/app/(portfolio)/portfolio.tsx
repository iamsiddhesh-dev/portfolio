import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { projects } from '@/content/projects';
import { theme } from '@/theme/theme';

/**
 * ACT II — Portfolio (placeholder shell). Phases 3–5 fill this with the
 * reverse-scroll flagship, momentum scroll, morphs and the card deck. For now it
 * proves navigation + renders the real project roster from content/projects.ts.
 */
export default function PortfolioScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="overline" color="accent">
          Act II · Portfolio
        </Text>
        <Text variant="h1" style={styles.title}>
          The work
        </Text>
        <Text variant="body" color="textSecondary">
          Placeholder shell — the animation-heavy showcase lands in Phases 3–5.
        </Text>
      </View>

      <View style={styles.list}>
        {projects.map((p, i) => (
          <View key={p.id} style={styles.row}>
            <Text variant="caption" color="textMuted" style={styles.index}>
              {String(i + 1).padStart(2, '0')}
            </Text>
            <View style={styles.rowText}>
              <Text variant="h3">{p.name}</Text>
              <Text variant="caption" color="textSecondary" numberOfLines={1}>
                {p.tagline}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="To the exit" trailing="→" onPress={() => router.push('/exit')} />
        <Button label="Back to entry" variant="ghost" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xl,
  },
  title: {
    marginTop: theme.spacing.xs,
  },
  list: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
    paddingBottom: theme.spacing.lg,
  },
  index: {
    width: 24,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  actions: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
});
