/**
 * Content for the Phase 4 momentum-scroll journey — three scroll-tied scenes:
 * skills, stats, and a career timeline. Everything here is DERIVED from
 * `projects.ts` (the roster, its years, its stacks) rather than invented, so it
 * stays honest and in sync as the project data firms up. No new ground-truth
 * facts about Siddhesh are asserted that aren't already implied by the roster.
 */
import { projects } from "./projects";

/* ── Scene 1 — the stack I reach for ──
 * `label` is a category (straight from the résumé's Technical Skills
 * section), `note` is a joined tool list for that category — same row
 * layout as the original per-tool version, just grouped one level up. */
export const skills: { label: string; note: string }[] = [
  { label: "Frontend", note: "React · React Native · Next.js" },
  { label: "Backend", note: "FastAPI · Node.js · REST APIs" },
  { label: "AI / ML", note: "Python · Groq · LLMs" },
  { label: "Tools", note: "Docker · Git · Postman" },
  { label: "Databases", note: "PostgreSQL · Supabase" },
];

/* ── Scene 2 — by the numbers ──
 * Derived where possible so the figures can't drift from the real roster. */
const liveCount = projects.filter((p) =>
  p.links.some((l) => /live|demo/i.test(l.label)),
).length;

export type Stat = { value: number; suffix?: string; label: string };

export const stats: Stat[] = [
  { value: projects.length, label: "Products shipped" },
  { value: 60, label: "fps, hand-tuned" },
  { value: liveCount, label: "Live deployments" },
  { value: 100, suffix: "%", label: "Motion hand-built" },
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
