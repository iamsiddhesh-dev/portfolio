/**
 * Closes the three-act arc: thank-you copy, a link back to where the work
 * lives, and a replay option so the tip flow doesn't feel like a dead end.
 * Reuses `ProjectLinks`' pill styling (built in Phase 5) for visual continuity.
 */
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ProjectLinks } from '@/components/portfolio/ProjectLinks';
import { Text } from '@/components/Text';
import { theme } from '@/theme/theme';

const SIGN_OFF_LINKS = [
  { label: 'GitHub', url: 'https://github.com/iamsiddhesh-dev', icon: 'github' as const },
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/siddheshkasat/',
    icon: 'linkedin' as const,
  },
  { label: 'Email', url: 'mailto:siddheshkasat.sk@gmail.com', icon: 'mail' as const },
];

export function SignOff({
  onReplay,
  onSignOut,
}: {
  onReplay: () => void;
  onSignOut: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text variant="overline" color="accent" center>
        Thank you
      </Text>
      <Text variant="h1" center style={styles.title}>
        That means a lot.
      </Text>
      <Text variant="bodyLg" color="textSecondary" center style={styles.lede}>
        Thanks for scrolling all the way through. If you&rsquo;re hiring, building, or
        just curious what&rsquo;s next — here&rsquo;s where to find me.
      </Text>
      <ProjectLinks links={SIGN_OFF_LINKS} />
      <View style={styles.actions}>
        <Button label="Tip again" variant="secondary" onPress={onReplay} />
        <Button label="Sign out" variant="ghost" onPress={onSignOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: theme.spacing.lg,
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
    marginTop: theme.spacing.md,
  },
});
