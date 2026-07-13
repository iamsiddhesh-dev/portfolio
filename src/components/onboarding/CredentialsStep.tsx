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

/**
 * Step 1 — email + password only. On sign-up this JUST creates the pending
 * sign-up (`signUp.password()`); it deliberately does NOT send the email code or
 * verify yet. Email verification is moved to the very LAST step, because in this
 * Clerk (Future API) config verifying the email *completes* the sign-up, and a
 * completed sign-up gets cleared from the client — so any metadata we still
 * needed to attach (visitor type + reason) and the finalize() call would fail
 * with "no created session". Collect everything first, verify + finalize last.
 * Sign-in is unchanged: it can complete immediately.
 */
export function CredentialsStep({
  mode,
  onModeChange,
  signUpHook,
  signInHook,
  onCredentialsDone,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  signUpHook: SignUpHook;
  signInHook: SignInHook;
  onCredentialsDone: (email: string) => void;
}) {
  const { signUp, errors: signUpErrors, fetchStatus: signUpFetchStatus } = signUpHook;
  const { signIn, errors: signInErrors, fetchStatus: signInFetchStatus } = signInHook;
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const fetching =
    mode === 'signUp' ? signUpFetchStatus === 'fetching' : signInFetchStatus === 'fetching';

  const handleSubmitCredentials = async () => {
    setGlobalError(null);
    if (mode === 'signUp') {
      // Creates the pending sign-up with email + password. No code send here —
      // that happens after visitor type + reason are captured (see EntryScreen).
      const { error } = await signUp.password({ emailAddress: email, password });
      if (error) return;
      haptics.medium();
      onCredentialsDone(email.trim());
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
