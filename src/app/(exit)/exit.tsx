import { useState } from 'react';
import { useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { AnimatePresence, MotiView } from 'moti';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AccentOrb } from '@/components/AccentOrb';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Celebration } from '@/components/exit/Celebration';
import { SignOff } from '@/components/exit/SignOff';
import { TipCard } from '@/components/exit/TipCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { haptics } from '@/lib/haptics';
import { createTipPaymentIntent, TipIntentError, tipPresets } from '@/lib/tips';
import { theme } from '@/theme/theme';

type Stage = 'select' | 'celebrating' | 'signoff';

const STAGE_TRANSITION = {
  type: 'timing' as const,
  duration: theme.duration.base,
  easing: theme.easing.emphasized,
};

/**
 * ACT III — Exit. Preset tip → Stripe PaymentSheet (test mode) → celebration →
 * sign-off. Test card 4242 4242 4242 4242 succeeds; 4000 0000 0000 0002 declines.
 */
export default function ExitScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [stage, setStage] = useState<Stage>('select');
  const [selectedId, setSelectedId] = useState(tipPresets[1].id);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signOutConfirmVisible, setSignOutConfirmVisible] = useState(false);

  const selected = tipPresets.find((p) => p.id === selectedId)!;

  async function handleTip() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const clientSecret = await createTipPaymentIntent(selected.amountCents);

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Siddhesh Kasat',
        paymentIntentClientSecret: clientSecret,
      });
      if (initError) throw new TipIntentError(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === 'Canceled') {
          setLoading(false);
          return;
        }
        throw new TipIntentError(presentError.message);
      }

      haptics.success();
      setLoading(false);
      setStage('celebrating');
    } catch (err) {
      haptics.warning();
      setLoading(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong — please try again.',
      );
    }
  }

  const handleSignOut = async () => {
    haptics.medium();
    try {
      await signOut();
    } catch {
      haptics.warning();
    }
  };

  return (
    <Screen>
      <AnimatePresence exitBeforeEnter>
        {stage === 'select' ? (
          <MotiView
            key="select"
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -12 }}
            transition={STAGE_TRANSITION}
            style={styles.container}
          >
            <AccentOrb size={110} />
            <View style={styles.copy}>
              <Text variant="h1" center style={styles.title}>
                Enjoyed this?
              </Text>
              <Text variant="bodyLg" color="textSecondary" center style={styles.lede}>
                Buy me a coffee — test mode, no real charge. Pick an amount below.
              </Text>
            </View>

            <View style={styles.presets}>
              {tipPresets.map((preset) => (
                <TipCard
                  key={preset.id}
                  preset={preset}
                  selected={preset.id === selectedId}
                  disabled={loading}
                  onPress={() => setSelectedId(preset.id)}
                />
              ))}
            </View>

            {errorMessage ? (
              <Text variant="caption" color="danger" center>
                {errorMessage}
              </Text>
            ) : null}

            <View style={styles.actions}>
              <Button
                label={loading ? 'Starting…' : `Tip ${selected.label}`}
                trailing={loading ? undefined : '☕'}
                onPress={handleTip}
                disabled={loading}
              />
              {loading ? <ActivityIndicator color={theme.colors.accent} /> : null}
              <Button
                label="Back to portfolio"
                variant="secondary"
                onPress={() => router.replace('/portfolio')}
                disabled={loading}
              />
            </View>
          </MotiView>
        ) : stage === 'celebrating' ? (
          <MotiView
            key="celebrating"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'timing', duration: theme.duration.fast }}
            style={styles.container}
          >
            <Celebration onDone={() => setStage('signoff')} />
          </MotiView>
        ) : (
          <MotiView
            key="signoff"
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={STAGE_TRANSITION}
            style={styles.container}
          >
            <SignOff
              onReplay={() => {
                setErrorMessage(null);
                setStage('select');
              }}
              onSignOut={() => setSignOutConfirmVisible(true)}
            />
          </MotiView>
        )}
      </AnimatePresence>

      <ConfirmModal
        visible={signOutConfirmVisible}
        title="Sign out?"
        body="You’ll be back at the start page — sign in again any time, no issue."
        cancelLabel="Stay signed in"
        confirmLabel="Sign out"
        onCancel={() => setSignOutConfirmVisible(false)}
        onConfirm={() => {
          setSignOutConfirmVisible(false);
          handleSignOut();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xxl,
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
  presets: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignSelf: 'stretch',
  },
  actions: {
    alignSelf: 'stretch',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
});
