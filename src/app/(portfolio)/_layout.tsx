import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';

import type { Project } from '@/content/projects';
import { MorphProvider } from '@/lib/morph';
import { theme } from '@/theme/theme';

/**
 * Wraps the act's Stack in `MorphProvider` (see `src/lib/morph.tsx`) so the
 * shared-element morph overlay can render above every screen in this group.
 * `project/[id]` gets its native transition + swipe-back gesture disabled —
 * the morph is the only visual transition for that route, in both directions.
 */
export default function PortfolioLayout() {
  const router = useRouter();

  return (
    <View style={styles.root}>
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
          <Stack.Screen name="project/[id]" options={{ animation: 'none', gestureEnabled: false }} />
        </Stack>
      </MorphProvider>
    </View>
  );
}

const styles = { root: { flex: 1 } } as const;
