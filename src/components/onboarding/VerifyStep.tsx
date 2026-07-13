/**
 * Final step — email verification, moved to the END of onboarding on purpose.
 * By now the pending sign-up already carries email + password + unsafeMetadata
 * (visitor type + reason); verifying the code completes it and `finalize()` runs
 * immediately after, so the created session is activated with the metadata
 * already attached. This is the gate that actually drops you into the portfolio.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { StepShell } from '@/components/onboarding/StepShell';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { theme } from '@/theme/theme';

export function VerifyStep({
  email,
  submitting,
  error,
  fieldError,
  onSubmit,
  onResend,
}: {
  email: string;
  submitting: boolean;
  error?: string | null;
  fieldError?: string;
  onSubmit: (code: string) => void;
  onResend: () => void;
}) {
  const [code, setCode] = useState('');

  return (
    <StepShell
      stepKey="verify"
      eyebrow="Last step"
      title="Confirm it's you"
      subtitle={`Enter the code we just sent to ${email}.`}
    >
      <View style={styles.body}>
        <TextField
          label="Verification code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          autoFocus
          error={fieldError}
        />
        {error ? (
          <Text variant="caption" color="danger">
            {error}
          </Text>
        ) : null}
        <Button
          label={submitting ? 'Verifying…' : 'Enter the portfolio'}
          trailing={submitting ? undefined : '→'}
          disabled={submitting || code.trim().length === 0}
          onPress={() => onSubmit(code.trim())}
        />
        <Button label="Send a new code" variant="ghost" onPress={onResend} />
      </View>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: theme.spacing.xl,
  },
});
