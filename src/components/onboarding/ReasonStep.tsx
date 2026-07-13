import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { StepShell } from '@/components/onboarding/StepShell';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { theme } from '@/theme/theme';

export function ReasonStep({
  submitting,
  error,
  onSubmit,
}: {
  submitting: boolean;
  error?: string | null;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');

  return (
    <StepShell
      stepKey="reason"
      eyebrow="Step 3 of 3"
      title="Why are you here?"
      subtitle="One line is plenty."
    >
      <View style={styles.body}>
        <TextField
          label="Reason"
          placeholder="e.g. Scoping you for a frontend role"
          value={reason}
          onChangeText={setReason}
          returnKeyType="done"
          maxLength={140}
          autoFocus
        />
        {error ? (
          <Text variant="caption" color="danger">
            {error}
          </Text>
        ) : null}
        <Button
          label={submitting ? 'Finishing up…' : 'Enter the portfolio'}
          trailing={submitting ? undefined : '→'}
          disabled={submitting || reason.trim().length === 0}
          onPress={() => onSubmit(reason.trim())}
        />
      </View>
    </StepShell>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: theme.spacing.xl,
  },
});
