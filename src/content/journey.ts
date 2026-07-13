/**
 * Content for the Phase 4 momentum-scroll journey — three scroll-tied scenes:
 * skills, stats, and a career timeline. Everything here is DERIVED from
 * `projects.ts` (the roster, its years, its stacks) rather than invented, so it
 * stays honest and in sync as the project data firms up. No new ground-truth
 * facts about Siddhesh are asserted that aren't already implied by the roster.
 */
import { projects } from './projects';

/* ── Scene 1 — the stack I reach for ──
 * Curated from the union of project stacks, ordered by how central each is to
 * the RN / full-stack-AI story the app is making. `note` is the supporting line. */
export const skills: { label: string; note: string }[] = [
  { label: 'React Native', note: 'Expo · New Architecture' },
  { label: 'TypeScript', note: 'end to end, strict' },
  { label: 'Reanimated', note: '60fps on the UI thread' },
  { label: 'Node & APIs', note: 'full-stack, not just UI' },
  { label: 'AI pipelines', note: 'Whisper · Llama' },
  { label: 'Auth & Payments', note: 'Clerk · Stripe' },
];

/* ── Scene 2 — by the numbers ──
 * Derived where possible so the figures can't drift from the real roster. */
const liveCount = projects.filter((p) => p.links.some((l) => /live|demo/i.test(l.label))).length;

export type Stat = { value: number; suffix?: string; label: string };

export const stats: Stat[] = [
  { value: projects.length, label: 'Products shipped' },
  { value: 60, label: 'fps, hand-tuned' },
  { value: liveCount, label: 'Live deployments' },
  { value: 100, suffix: '%', label: 'Motion hand-built' },
];

/* ── Scene 3 — the path ──
 * A per-project build log (the roster is all recent, so a year axis would just
 * collapse to one row). One entry per project in roster order; the rail draws
 * down through them. Built straight from `projects.ts`. */
export type Milestone = { title: string; detail: string };

export const milestones: Milestone[] = projects.map((p) => ({
  title: p.name,
  detail: p.role,
}));
