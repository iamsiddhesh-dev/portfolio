/**
 * The real tappable entry point into project detail — the reel's cards stream
 * past with `pointerEvents="none"` (they're mid-animation, not a tap target),
 * so this section renders the same five projects as a plain, always-tappable
 * stacked list. Tap measures the card's on-screen frame and hands it to the
 * morph (`useMorph().open`), which owns the expand animation + navigation.
 */
import { useRef } from 'react';
import { StyleSheet, View, type View as RNView } from 'react-native';
import { MotiView } from 'moti';

import { Text } from '@/components/Text';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { projects } from '@/content/projects';
import { useMorph } from '@/lib/morph';
import { theme } from '@/theme/theme';

export function ProjectGrid() {
  const { open } = useMorph();
  const cardRefs = useRef<Record<string, RNView | null>>({});

  return (
    <View style={styles.root}>
      <Text variant="overline" color="accent">
        Full roster
      </Text>
      <Text variant="h2" style={styles.title}>
        Tap one to look closer
      </Text>

      <View style={styles.list}>
        {projects.map((project, index) => (
          <MotiView
            key={project.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: theme.duration.base, delay: index * 70 }}
          >
            <ProjectCard
              ref={(node) => {
                cardRefs.current[project.id] = node;
              }}
              project={project}
              index={index}
              onPress={() => {
                const node = cardRefs.current[project.id];
                node?.measureInWindow((x, y, width, height) => {
                  open(project, { x, y, width, height });
                });
              }}
            />
          </MotiView>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingTop: theme.spacing.xxxl,
  },
  title: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  list: {
    gap: theme.spacing.lg,
  },
});
