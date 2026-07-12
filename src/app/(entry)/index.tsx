import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { StyleSheet, View } from 'react-native';

import { AccentOrb } from '@/components/AccentOrb';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { Screen } from '@/components/Screen';
import { theme } from '@/theme/theme';

/**
 * ACT I — Entry (placeholder). In Phase 2 this becomes the Clerk-auth onboarding.
 * For now it's the on-brand front door + the hub to reach the style tile and acts.
 * Uses Moti for a staggered entrance — the first (deliberately low-stakes) Moti use,
 * doubling as a Reanimated-4 compatibility check.
 */
export default function EntryScreen() {
  const router = useRouter();

  // Staggered reveal: each child fades + rises, offset by index.
  const rise = (delay: number) => ({
    from: { opacity: 0, translateY: 18 },
    animate: { opacity: 1, translateY: 0 },
    transition: { type: 'timing' as const, duration: theme.duration.base, delay },
  });

  return (
    <Screen>
      <View style={styles.container}>
        <MotiView {...rise(120)} style={styles.orb}>
          <AccentOrb size={150} />
        </MotiView>

        <View style={styles.copy}>
          <MotiView {...rise(220)}>
            <Text variant="overline" color="accent">
              Act I · Entry
            </Text>
          </MotiView>
          <MotiView {...rise(320)}>
            <Text variant="display" style={styles.title}>
              Siddhesh
            </Text>
          </MotiView>
          <MotiView {...rise(420)}>
            <Text variant="bodyLg" color="textSecondary" style={styles.lede}>
              Frontend & full-stack engineer. This is a portfolio built as a
              native app — not a website. Come in.
            </Text>
          </MotiView>
        </View>

        <MotiView {...rise(560)} style={styles.actions}>
          <Button
            label="Enter the portfolio"
            trailing="→"
            onPress={() => router.push('/portfolio')}
          />
          <Button
            label="View the style tile"
            variant="secondary"
            onPress={() => router.push('/style-tile')}
          />
        </MotiView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.xxxl,
  },
  orb: {
    alignItems: 'center',
  },
  copy: {
    gap: theme.spacing.md,
  },
  title: {
    marginTop: theme.spacing.xs,
  },
  lede: {
    maxWidth: 320,
  },
  actions: {
    gap: theme.spacing.md,
  },
});
