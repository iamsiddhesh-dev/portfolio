import { Stack, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AccentOrb } from '@/components/AccentOrb';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { colors, theme, type TypeVariant } from '@/theme/theme';

/**
 * STYLE TILE — the premium litmus test. One screen that puts the whole art
 * direction on the table: type scale, palette, the motion sample, and the
 * component vocabulary. If this screen doesn't read as premium, nothing will.
 */
export default function StyleTileScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ animation: 'slide_from_bottom' }} />
      <Screen edges={['top']} glow={false}>
        <View style={styles.grabber} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {/* Heading */}
          <View style={styles.headerBlock}>
            <Text variant="overline" color="accent">
              Style Tile · Art Direction
            </Text>
            <Text variant="h1" style={styles.headerTitle}>
              The grade
            </Text>
            <Text variant="body" color="textSecondary">
              Cinematic near-black, one amber light source, Clash Display over
              Satoshi. Everything downstream inherits this.
            </Text>
          </View>

          {/* Motion sample */}
          <Section label="Motion · the light source">
            <View style={styles.orbStage}>
              <AccentOrb size={168} />
            </View>
            <Text variant="caption" color="textMuted" center>
              Breathing on the UI thread · emphasized-decelerate · 60fps
            </Text>
          </Section>

          {/* Type scale */}
          <Section label="Typography · Clash Display + Satoshi">
            <Specimen variant="display" note="Display · Clash 56" />
            <Specimen variant="h1" note="H1 · Clash 40" />
            <Specimen variant="h2" note="H2 · Clash 30" />
            <Specimen variant="h3" note="H3 · Clash 22" />
            <Specimen variant="bodyLg" note="Body Lg · Satoshi 18" sample="The quick brown fox jumps over the lazy dog." />
            <Specimen variant="body" note="Body · Satoshi 16" sample="The quick brown fox jumps over the lazy dog." />
            <Specimen variant="caption" note="Caption · Satoshi 13" sample="Metadata, timestamps, supporting detail." />
            <Specimen variant="overline" note="Overline · Satoshi 11" sample="Section Eyebrow" />
          </Section>

          {/* Palette */}
          <Section label="Palette · warm near-black + amber">
            <View style={styles.swatchGrid}>
              <Swatch name="bg" hex={colors.bg} />
              <Swatch name="surface" hex={colors.surface} />
              <Swatch name="surfaceRaised" hex={colors.surfaceRaised} />
              <Swatch name="surfaceHi" hex={colors.surfaceHi} />
              <Swatch name="accent" hex={colors.accent} border={false} />
              <Swatch name="accentBright" hex={colors.accentBright} border={false} />
              <Swatch name="text" hex={colors.text} border={false} />
              <Swatch name="textSecondary" hex={colors.textSecondary} />
            </View>
          </Section>

          {/* Components */}
          <Section label="Components · press · haptics">
            <View style={styles.buttons}>
              <Button label="Primary action" trailing="→" />
              <Button label="Secondary action" variant="secondary" />
              <Button label="Ghost action" variant="ghost" />
            </View>
            <Text variant="caption" color="textMuted">
              Every press: spring scale + haptic tick. Try them.
            </Text>
          </Section>

          <Button label="Close" variant="secondary" onPress={() => router.back()} />
        </ScrollView>
      </Screen>
    </>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
        {label}
      </Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Specimen({
  variant,
  note,
  sample,
}: {
  variant: TypeVariant;
  note: string;
  sample?: string;
}) {
  return (
    <View style={styles.specimen}>
      <Text variant={variant}>{sample ?? 'Aa'}</Text>
      <Text variant="caption" color="textMuted">
        {note}
      </Text>
    </View>
  );
}

function Swatch({ name, hex, border = true }: { name: string; hex: string; border?: boolean }) {
  return (
    <View style={styles.swatch}>
      <View
        style={[
          styles.swatchChip,
          { backgroundColor: hex },
          border && { borderWidth: 1, borderColor: theme.colors.hairlineStrong },
        ]}
      />
      <Text variant="caption" numberOfLines={1}>
        {name}
      </Text>
      <Text variant="caption" color="textMuted">
        {hex}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.hairlineStrong,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  scroll: {
    gap: theme.spacing.xxxl,
    paddingBottom: theme.spacing.huge,
  },
  headerBlock: {
    gap: theme.spacing.sm,
  },
  headerTitle: {
    marginTop: theme.spacing.xs,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionLabel: {
    paddingLeft: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.hairline,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  orbStage: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  specimen: {
    gap: theme.spacing.xs,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  swatch: {
    width: '28%',
    gap: theme.spacing.xs,
  },
  swatchChip: {
    height: 56,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
  },
  buttons: {
    gap: theme.spacing.md,
  },
});
