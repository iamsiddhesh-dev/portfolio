import { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { CredentialsStep, type Mode } from '@/components/onboarding/CredentialsStep';
import { ReasonStep } from '@/components/onboarding/ReasonStep';
import { VisitorTypeStep } from '@/components/onboarding/VisitorTypeStep';
import { Screen } from '@/components/Screen';
import { haptics } from '@/lib/haptics';
import type { VisitorType } from '@/types/clerk';

type Step = 'credentials' | 'visitorType' | 'reason';

/**
 * ACT I — Entry. Real Clerk auth doubling as a designed "who are you and why
 * are you here?" moment: credentials → visitor type → reason, all captured in
 * unsafeMetadata before the sign-up is finalized. Existing users skip straight
 * to Step 1's sign-in path and land in the portfolio without the extra steps.
 */
export default function EntryScreen() {
  const signUpHook = useSignUp();
  const signInHook = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<Step>('credentials');
  const [mode, setMode] = useState<Mode>('signUp');
  const [visitorType, setVisitorType] = useState<VisitorType | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);

  const handleReasonSubmit = async (reason: string) => {
    if (!visitorType) return;
    setFinalizing(true);
    setFinalizeError(null);

    const { signUp } = signUpHook;
    const { error: updateError } = await signUp.update({ unsafeMetadata: { visitorType, reason } });
    if (updateError) {
      setFinalizeError(updateError.message ?? 'Could not save your details.');
      setFinalizing(false);
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
      setFinalizeError(finalizeErr.message ?? 'Could not complete sign-up.');
      setFinalizing(false);
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      {step === 'credentials' ? (
        <CredentialsStep
          mode={mode}
          onModeChange={setMode}
          signUpHook={signUpHook}
          signInHook={signInHook}
          onSignUpVerified={() => setStep('visitorType')}
        />
      ) : step === 'visitorType' ? (
        <VisitorTypeStep
          onSelect={(value) => {
            setVisitorType(value);
            setStep('reason');
          }}
        />
      ) : (
        <ReasonStep submitting={finalizing} error={finalizeError} onSubmit={handleReasonSubmit} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
});
