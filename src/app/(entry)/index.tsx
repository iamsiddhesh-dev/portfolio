import { useEffect, useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { BackHandler, Platform, StyleSheet } from 'react-native';

import { CredentialsStep, type Mode } from '@/components/onboarding/CredentialsStep';
import { VerifyStep } from '@/components/onboarding/VerifyStep';
import { VISITOR_OPTIONS, VisitorTypeStep } from '@/components/onboarding/VisitorTypeStep';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { Screen } from '@/components/Screen';
import { haptics } from '@/lib/haptics';
import type { VisitorType } from '@/types/clerk';

type Step = 'welcome' | 'credentials' | 'visitorType' | 'verify' | 'signInVerify';

/**
 * ACT I — Entry. Opens on a title-card welcome (swipe up to continue — no auth
 * yet, just an invitation), then real Clerk auth doubling as a designed "who are
 * you and why are you here?" moment. Order matters from there: credentials →
 * visitor type (picking a card already says why they're here — its hint text
 * doubles as the `reason` metadata, no separate free-text step) → verify (which
 * completes + finalizes the sign-up in one shot). Verification is last so
 * metadata is attached BEFORE the sign-up completes — deferring finalize past
 * completion fails, because Clerk clears a completed sign-up from the client.
 * Existing users take the sign-in path in Step 1 and land straight in the
 * portfolio.
 */
export default function EntryScreen() {
  const signUpHook = useSignUp();
  const signInHook = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>('welcome');
  const [mode, setMode] = useState<Mode>('signUp');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // The whole act is one screen with internal state, not a route stack, so
  // Android's hardware back button has nothing of ours to pop by default —
  // it falls straight through to exiting the app. Intercept it and step
  // backward through the act instead; only the very first screen (welcome)
  // lets the default behavior (exit) through.
  useEffect(() => {
    // No hardware back button on web — react-native-web's BackHandler stub
    // logs a console.error on addEventListener, so skip registering entirely.
    if (Platform.OS === 'web') return;

    const goBack = (): boolean => {
      switch (step) {
        case 'credentials':
          setStep('welcome');
          return true;
        case 'visitorType':
          setStep('credentials');
          return true;
        case 'verify':
          setStep('visitorType');
          return true;
        case 'signInVerify':
          setStep('credentials');
          return true;
        default:
          return false;
      }
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => subscription.remove();
  }, [step]);

  // Step 2: picking a visitor-type card is the whole "why are you here" —
  // transition to verify immediately (a card tap should read as instant, not
  // wait on a network round-trip), then stash the hint text as the `reason`
  // metadata and send the code in the background. Any failure surfaces on the
  // verify screen itself, which already has a "Send a new code" retry.
  const handleVisitorTypeSelect = (value: VisitorType) => {
    haptics.medium();
    setVerifyError(null);
    setStep('verify');

    const reason = VISITOR_OPTIONS.find((option) => option.value === value)?.hint ?? '';
    const { signUp } = signUpHook;
    void (async () => {
      const { error: updateError } = await signUp.update({
        unsafeMetadata: { visitorType: value, reason },
      });
      if (updateError) {
        setVerifyError(updateError.message ?? 'Could not save your details.');
        return;
      }
      const { error: codeError } = await signUp.verifications.sendEmailCode();
      if (codeError) {
        setVerifyError(codeError.message ?? 'Could not send a verification code.');
      }
    })();
  };

  // Final step: verify the code → sign-up completes with metadata attached →
  // finalize activates the session and drops us into the portfolio.
  const handleVerify = async (code: string) => {
    setBusy(true);
    setVerifyError(null);

    const { signUp } = signUpHook;
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      // Field-level "wrong code" errors already surface via signUpHook.errors;
      // only set a global message for anything else.
      if (!signUpHook.errors.fields.code) {
        setVerifyError(error.message ?? 'That code didn’t work.');
      }
      setBusy(false);
      return;
    }

    if (signUp.status !== 'complete') {
      setVerifyError(
        `Sign-up not complete (status: ${signUp.status}). ` +
          `Missing: [${signUp.missingFields.join(', ') || 'none'}].`,
      );
      setBusy(false);
      return;
    }

    const { error: finalizeErr } = await signUp.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) return;
        haptics.success();
        router.replace('/portfolio');
      },
    });
    if (finalizeErr) {
      setVerifyError(
        `${finalizeErr.message ?? 'Could not complete sign-up.'} ` +
          `(createdSessionId: ${signUp.createdSessionId ?? 'null'})`,
      );
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setVerifyError(null);
    const { error } = await signUpHook.signUp.verifications.sendEmailCode();
    if (error) {
      setVerifyError(error.message ?? 'Could not resend the code.');
    }
  };

  // Sign-in's "new device" path: password already checked out, this is just
  // the Client Trust second factor before finalize() can activate a session.
  const handleSignInVerify = async (code: string) => {
    setBusy(true);
    setVerifyError(null);

    const { signIn } = signInHook;
    const { error } = await signIn.mfa.verifyEmailCode({ code });
    if (error) {
      if (!signInHook.errors.fields.code) {
        setVerifyError(error.message ?? 'That code didn’t work.');
      }
      setBusy(false);
      return;
    }

    if (signIn.status !== 'complete') {
      setVerifyError(`Sign-in not complete (status: ${signIn.status}).`);
      setBusy(false);
      return;
    }

    const { error: finalizeErr } = await signIn.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) return;
        haptics.success();
        router.replace('/portfolio');
      },
    });
    if (finalizeErr) {
      setVerifyError(finalizeErr.message ?? 'Could not complete sign-in.');
      setBusy(false);
    }
  };

  const handleSignInResend = async () => {
    setVerifyError(null);
    const { error } = await signInHook.signIn.mfa.sendEmailCode();
    if (error) {
      setVerifyError(error.message ?? 'Could not resend the code.');
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      {step === 'welcome' ? (
        <WelcomeStep onContinue={() => setStep('credentials')} />
      ) : step === 'credentials' ? (
        <CredentialsStep
          mode={mode}
          onModeChange={setMode}
          signUpHook={signUpHook}
          signInHook={signInHook}
          onBack={() => setStep('welcome')}
          onCredentialsDone={(value) => {
            setEmail(value);
            setStep('visitorType');
          }}
          onSignInNeedsVerification={(value) => {
            setEmail(value);
            setStep('signInVerify');
          }}
        />
      ) : step === 'visitorType' ? (
        <VisitorTypeStep onSelect={handleVisitorTypeSelect} />
      ) : step === 'signInVerify' ? (
        <VerifyStep
          email={email}
          submitting={busy}
          error={verifyError}
          fieldError={signInHook.errors.fields.code?.message}
          onSubmit={handleSignInVerify}
          onResend={handleSignInResend}
        />
      ) : (
        <VerifyStep
          email={email}
          submitting={busy}
          error={verifyError}
          fieldError={signUpHook.errors.fields.code?.message}
          onSubmit={handleVerify}
          onResend={handleResend}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
});
