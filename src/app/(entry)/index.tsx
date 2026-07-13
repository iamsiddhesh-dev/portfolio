import { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { CredentialsStep, type Mode } from '@/components/onboarding/CredentialsStep';
import { ReasonStep } from '@/components/onboarding/ReasonStep';
import { VerifyStep } from '@/components/onboarding/VerifyStep';
import { VisitorTypeStep } from '@/components/onboarding/VisitorTypeStep';
import { Screen } from '@/components/Screen';
import { haptics } from '@/lib/haptics';
import type { VisitorType } from '@/types/clerk';

type Step = 'credentials' | 'visitorType' | 'reason' | 'verify';

/**
 * ACT I — Entry. Real Clerk auth doubling as a designed "who are you and why are
 * you here?" moment. Order matters: credentials → visitor type → reason (which
 * attaches unsafeMetadata to the still-pending sign-up and fires the email code)
 * → verify (which completes + finalizes the sign-up in one shot). Verification is
 * last so metadata is attached BEFORE the sign-up completes — deferring finalize
 * past completion fails, because Clerk clears a completed sign-up from the client.
 * Existing users take the sign-in path in Step 1 and land straight in the portfolio.
 */
export default function EntryScreen() {
  const signUpHook = useSignUp();
  const signInHook = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>('credentials');
  const [mode, setMode] = useState<Mode>('signUp');
  const [email, setEmail] = useState('');
  const [visitorType, setVisitorType] = useState<VisitorType | null>(null);
  const [busy, setBusy] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Step 3: stash the metadata on the pending sign-up, send the code, go verify.
  const handleReasonSubmit = async (reason: string) => {
    if (!visitorType) return;
    setBusy(true);
    setReasonError(null);

    const { signUp } = signUpHook;
    const { error: updateError } = await signUp.update({
      unsafeMetadata: { visitorType, reason },
    });
    if (updateError) {
      setReasonError(updateError.message ?? 'Could not save your details.');
      setBusy(false);
      return;
    }

    const { error: codeError } = await signUp.verifications.sendEmailCode();
    if (codeError) {
      setReasonError(codeError.message ?? 'Could not send a verification code.');
      setBusy(false);
      return;
    }

    setBusy(false);
    haptics.medium();
    setStep('verify');
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

  const handleResend = () => {
    setVerifyError(null);
    signUpHook.signUp.verifications.sendEmailCode();
  };

  return (
    <Screen contentStyle={styles.content}>
      {step === 'credentials' ? (
        <CredentialsStep
          mode={mode}
          onModeChange={setMode}
          signUpHook={signUpHook}
          signInHook={signInHook}
          onCredentialsDone={(value) => {
            setEmail(value);
            setStep('visitorType');
          }}
        />
      ) : step === 'visitorType' ? (
        <VisitorTypeStep
          onSelect={(value) => {
            setVisitorType(value);
            setStep('reason');
          }}
        />
      ) : step === 'reason' ? (
        <ReasonStep submitting={busy} error={reasonError} onSubmit={handleReasonSubmit} />
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
