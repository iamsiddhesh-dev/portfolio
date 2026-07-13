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
const years = projects.map((p) => Number(p.year)).filter((y) => !Number.isNaN(y));
const spanYears = years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;

export type Stat = { value: number; suffix?: string; label: string };

export const stats: Stat[] = [
  { value: projects.length, label: 'Products shipped' },
  { value: 60, label: 'fps, hand-tuned' },
  { value: spanYears, label: 'Years building' },
  { value: 100, suffix: '%', label: 'Motion hand-built' },
];

/* ── Scene 3 — the path ──
 * The roster grouped by year, newest last, so the timeline reads bottom-up as
 * the line draws down. Built straight from `projects.ts`. */
export type Milestone = { year: string; names: string[] };

export const milestones: Milestone[] = Object.entries(
  projects.reduce<Record<string, string[]>>((acc, p) => {
    (acc[p.year] ??= []).push(p.name);
    return acc;
  }, {}),
)
  .sort(([a], [b]) => Number(a) - Number(b))
  .map(([year, names]) => ({ year, names }));
