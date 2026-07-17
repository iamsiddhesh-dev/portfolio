/**
 * Themed stand-in for `Alert.alert()` — the native alert would render in the
 * OS's default light/system style, breaking the dark-locked, amber-accented
 * premium bar. Generic confirm/cancel dialog; callers supply the copy.
 */
import { Modal, StyleSheet, View } from 'react-native';
import { MotiView } from 'moti';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { theme } from '@/theme/theme';

export function ConfirmModal({
  visible,
  title,
  body,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <MotiView
          from={{ opacity: 0, translateY: reducedMotion ? 0 : 12, scale: reducedMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{
            type: 'timing',
            duration: reducedMotion ? 0 : theme.duration.fast,
            easing: theme.easing.emphasized,
          }}
          style={styles.card}
        >
          <Text variant="h3">{title}</Text>
          <Text variant="body" color="textSecondary" style={styles.body}>
            {body}
          </Text>
          <View style={styles.actions}>
            <Button label={cancelLabel} onPress={onCancel} />
            <Button label={confirmLabel} variant="ghost" onPress={onConfirm} />
          </View>
        </MotiView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.hairlineStrong,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  body: {
    marginBottom: theme.spacing.sm,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
