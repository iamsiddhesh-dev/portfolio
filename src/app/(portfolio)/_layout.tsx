import { Stack, useRouter } from 'expo-router';

import type { Project } from '@/content/projects';
import { MorphProvider } from '@/lib/morph';
import { theme } from '@/theme/theme';

/**
 * Wraps the act's Stack in `MorphProvider` (see `src/lib/morph.tsx`) so the
 * shared-element morph overlay can render above every screen in this group.
 * `project/[id]` gets its native transition + swipe-back gesture disabled —
 * the morph is the only visual transition for that route, in both directions.
 *
 * ⚠️ Do NOT wrap `<Stack>` in a plain `<View>` here. On native, react-native-
 * screens needs the nested navigator laid out by its parent directly; a plain
 * `<View>` in between collapses the screen to zero height.
 *
 * ⚠️ `portfolio` MUST be declared explicitly here, and listed BEFORE
 * `project/[id]`. Mixing one explicit `<Stack.Screen>` (needed to customize
 * `project/[id]`'s transition) with an otherwise-implicit, file-based screen
 * list makes native-stack's initial-route resolution ambiguous — on the
 * Android/iOS build it was picking `project/[id]` (with no `id` param) as the
 * active screen instead of `portfolio`, which just silently renders nothing
 * (`if (!project) return null` in that screen) — a black screen with zero
 * error, since nothing actually throws. Web resolves the initial screen
 * directly from the URL and never hit this, which is why it only reproduced
 * on native. Declaring both screens explicitly, in this order, removes the
 * ambiguity entirely.
 */
export default function PortfolioLayout() {
  const router = useRouter();

  return (
    <MorphProvider
      onNavigateOpen={(project: Project) => router.push({ pathname: '/project/[id]', params: { id: project.id } })}
      onNavigateClose={() => router.back()}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Stack.Screen name="portfolio" />
        <Stack.Screen name="project/[id]" options={{ animation: 'none', gestureEnabled: false }} />
      </Stack>
    </MorphProvider>
  );
}
