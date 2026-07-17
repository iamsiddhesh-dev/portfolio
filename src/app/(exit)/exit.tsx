import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/expo';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { AccentOrb } from '@/components/AccentOrb';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Celebration } from '@/components/exit/Celebration';
import { SignOff } from '@/components/exit/SignOff';
import { TipCard } from '@/components/exit/TipCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { haptics } from '@/lib/haptics';
import { useTipFlow } from '@/lib/tipFlow';
import { tipPresets } from '@/lib/tips';
import { theme } from '@/theme/theme';

type Stage = 'select' | 'celebrating' | 'signoff';

const STAGE_TRANSITION = {
  type: 'timing' as const,
  duration: theme.duration.base,
  easing: theme.easing.emphasized,
};

/**
 * ACT III — Exit. Preset tip → Stripe → celebration → sign-off. On native
 * this is PaymentSheet (test card 4242 4242 4242 4242 succeeds; 4000 0000
 * 0000 0002 declines) via useTipFlow (lib/tipFlow.ts). On web,
 * @stripe/stripe-react-native has no build at all, so useTipFlow
 * (lib/tipFlow.web.ts) redirects the browser to a Stripe Checkout Session
 * instead — the browser leaves the app entirely and Stripe redirects back to
 * this same route with a `status=success|cancel` query param, read below to
 * resume the stage machine after the fresh page load.
 */
export default function ExitScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { startTip } = useTipFlow();
  const params = useLocalSearchParams<{ status?: string }>();

  const [stage, setStage] = useState<Stage>('select');
  const [selectedId, setSelectedId] = useState(tipPresets[1].id);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signOutConfirmVisible, setSignOutConfirmVisible] = useState(false);

  const selected = tipPresets.find((p) => p.id === selectedId)!;

  useEffect(() => {
    // Only ever populated on web, coming back from a Checkout redirect.
    if (params.status === 'success') {
      haptics.success();
      setStage('celebrating');
    } else if (params.status === 'cancel') {
      setErrorMessage('Checkout cancelled — no charge was made.');
    }
    // Only meant to run once, off the redirect Checkout lands back with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTip() {
    setLoading(true);
    setErrorMessage(null);

    const result = await startTip(selected.amountCents);

    switch (result.status) {
      case 'success':
        haptics.success();
        setLoading(false);
        setStage('celebrating');
        break;
      case 'cancelled':
        setLoading(false);
        break;
      case 'redirecting':
        // Browser is navigating away to Stripe Checkout — stay loading.
        break;
      case 'error':
        haptics.warning();
        setLoading(false);
        setErrorMessage(result.message);
        break;
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
                label={loading ? (Platform.OS === 'web' ? 'Redirecting…' : 'Starting…') : `Tip ${selected.label}`}
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
