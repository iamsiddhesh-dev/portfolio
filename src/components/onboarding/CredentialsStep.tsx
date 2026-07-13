import { useState } from 'react';
import type { useSignIn, useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { StepShell } from '@/components/onboarding/StepShell';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { haptics } from '@/lib/haptics';
import { theme } from '@/theme/theme';

export type Mode = 'signUp' | 'signIn';

type SignUpHook = ReturnType<typeof useSignUp>;
type SignInHook = ReturnType<typeof useSignIn>;

export function CredentialsStep({
  mode,
  onModeChange,
  signUpHook,
  signInHook,
  onSignUpVerified,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  signUpHook: SignUpHook;
  signInHook: SignInHook;
  onSignUpVerified: () => void;
}) {
  const { signUp, errors: signUpErrors, fetchStatus: signUpFetchStatus } = signUpHook;
  const { signIn, errors: signInErrors, fetchStatus: signInFetchStatus } = signInHook;
  const router = useRouter();

  const [phase, setPhase] = useState<'form' | 'verify'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetching = mode === 'signUp' ? signUpFetchStatus === 'fetching' : signInFetchStatus === 'fetching';

  const handleSubmitCredentials = async () => {
    setGlobalError(null);
    if (mode === 'signUp') {
      const { error } = await signUp.password({ emailAddress: email, password });
      if (error) return;
      const { error: codeError } = await signUp.verifications.sendEmailCode();
      if (codeError) {
        setGlobalError(codeError.message ?? 'Could not send a verification code.');
        return;
      }
      haptics.medium();
      setPhase('verify');
    } else {
      const { error } = await signIn.password({ emailAddress: email, password });
      if (error) return;
      if (signIn.status === 'complete') {
        haptics.success();
        await signIn.finalize({
          navigate: ({ session }) => {
            if (session?.currentTask) return;
            router.replace('/portfolio');
          },
        });
      } else {
        setGlobalError('This account needs an extra verification step this flow doesn’t support yet.');
      }
    }
  };

  const handleVerifyCode = async () => {
    setGlobalError(null);
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) return;
    if (signUp.status === 'complete' || signUp.unverifiedFields.length === 0) {
      haptics.success();
      onSignUpVerified();
    } else {
      setGlobalError('Verification incomplete — double-check the code.');
    }
  };

  if (phase === 'verify') {
    return (
      <StepShell
        stepKey="verify"
        eyebrow="Step 1 of 3"
        title="Check your email"
        subtitle={`We sent a code to ${email}.`}
      >
        <View style={styles.body}>
          <TextField
            label="Verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoFocus
            error={signUpErrors.fields.code?.message}
          />
          {globalError ? (
            <Text variant="caption" color="danger">
              {globalError}
            </Text>
          ) : null}
          <Button
            label="Verify"
            trailing="→"
            disabled={fetching || code.length === 0}
            onPress={handleVerifyCode}
          />
          <Button
            label="Send a new code"
            variant="ghost"
            onPress={() => signUp.verifications.sendEmailCode()}
          />
        </View>
      </StepShell>
    );
  }

  return (
    <StepShell
      stepKey="credentials"
      eyebrow="Step 1 of 3"
      title={mode === 'signUp' ? 'Create your account' : 'Welcome back'}
      subtitle={
        mode === 'signUp'
          ? 'Real auth — this is who greets you inside.'
          : 'Sign in to pick up where you left off.'
      }
    >
      <View style={styles.body}>
        <TextField
          label="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          error={mode === 'signUp' ? signUpErrors.fields.emailAddress?.message : signInErrors.fields.identifier?.message}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          error={mode === 'signUp' ? signUpErrors.fields.password?.message : signInErrors.fields.password?.message}
        />
        {globalError ? (
          <Text variant="caption" color="danger">
            {globalError}
          </Text>
        ) : null}
        <Button
          label={mode === 'signUp' ? 'Continue' : 'Sign in'}
          trailing="→"
          disabled={fetching || !email || !password}
          onPress={handleSubmitCredentials}
        />
        <Button
          label={mode === 'signUp' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          variant="ghost"
          onPress={() => {
            setGlobalError(null);
            onModeChange(mode === 'signUp' ? 'signIn' : 'signUp');
          }}
        />
      </View>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: theme.spacing.lg,
  },
});
