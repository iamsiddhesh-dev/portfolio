import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AccentOrb } from '@/components/AccentOrb';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { theme } from '@/theme/theme';

/**
 * ACT III — Exit (placeholder). Phase 6 turns this into the Stripe "buy me a
 * coffee" tip flow + celebration close. For now it closes the three-act loop.
 */
export default function ExitScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.container}>
        <AccentOrb size={120} />
        <View style={styles.copy}>
          <Text variant="overline" color="accent" center>
            Act III · Exit
          </Text>
          <Text variant="h1" center style={styles.title}>
            Enjoyed this?
          </Text>
          <Text variant="bodyLg" color="textSecondary" center style={styles.lede}>
            The closing act becomes a real Stripe “buy me a coffee” in Phase 6 —
            with a celebration to send you off.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button label="Buy me a coffee" trailing="☕" disabled />
          <Button label="Start over" variant="secondary" onPress={() => router.replace('/')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xxxl,
  },
  copy: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  title: {
    marginTop: theme.spacing.xs,
  },
  lede: {
    maxWidth: 320,
  },
  actions: {
    alignSelf: 'stretch',
    gap: theme.spacing.md,
  },
});
