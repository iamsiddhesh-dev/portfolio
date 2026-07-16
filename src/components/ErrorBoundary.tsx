/**
 * Last-resort catch for render-time throws. Without this, an unexpected error
 * anywhere in the tree white-screens with no recovery — this at least gives a
 * themed fallback with a way back in, instead of a dead app.
 */
import { Component, type PropsWithChildren, type ReactNode } from 'react';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { theme } from '@/theme/theme';

type Props = PropsWithChildren<object>;
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  reset = () => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <Screen contentStyle={styles.content}>
          <Text variant="overline" color="accent">
            Something broke
          </Text>
          <Text variant="h2" style={styles.title}>
            That wasn’t supposed to happen
          </Text>
          <Text variant="body" color="textSecondary" style={styles.body}>
            An unexpected error interrupted the app. Try again — if it keeps happening, that’s on
            me, not you.
          </Text>
          <Button label="Try again" onPress={this.reset} style={styles.button} />
        </Screen>
      );
    }

    return this.props.children;
  }
}

const styles = {
  content: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  title: {
    marginTop: theme.spacing.xs,
  },
  body: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    textAlign: 'center' as const,
  },
  button: {
    minWidth: 200,
  },
};
