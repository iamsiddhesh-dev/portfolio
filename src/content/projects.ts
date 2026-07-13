/**
 * Portfolio content — the single source of project data. Every later phase
 * (reverse-scroll cards, card deck, detail morphs) reads from here, so nothing
 * downstream blocks on copy.
 *
 * ⚠️  Entries marked `draft: true` (Vibely, SpeakWell, Kodean) carry *inferred*
 *     copy — presentable, but written from the project names, not from Siddhesh's
 *     ground truth. The literal "DRAFT —" prefixes were removed so the flagship
 *     reads clean, but roles/years/highlights/links still need verifying before
 *     the app ships. The `draft` flag is how we keep track — it is NOT rendered.
 *     The candidate-intake app and this app are accurate.
 */

export type ProjectLink = {
  label: string;
  url: string;
};

export type Project = {
  id: string;
  /** Display name. */
  name: string;
  /** One-line hook, shown on cards. */
  tagline: string;
  role: string;
  year: string;
  /** Ordered, most-defining first. Rendered as chips. */
  stack: string[];
  /** 2–3 sentence description for the detail view. */
  description: string;
  /** Punchy accomplishment bullets. */
  highlights: string[];
  links: ProjectLink[];
  /** Set while copy is unverified so we can badge/flag it in dev. */
  draft?: boolean;
};

export const projects: Project[] = [
  {
    id: 'vibely',
    name: 'Vibely',
    tagline: 'A social app built around shared moods and moments',
    role: 'Founder · Full-stack',
    year: '2024',
    stack: ['React Native', 'Expo', 'TypeScript', 'Supabase'],
    description:
      'A social product exploring lightweight ways for people to share what they’re into in the moment — mood-first, feed-second.',
    highlights: [
      'Realtime mood feed on a Supabase backend',
      'Native mobile client built on Expo + React Native',
    ],
    links: [],
    draft: true,
  },
  {
    id: 'speakwell',
    name: 'SpeakWell',
    tagline: 'An AI coach for speaking and pronunciation',
    role: 'Founder · Full-stack',
    year: '2024',
    stack: ['React', 'TypeScript', 'LLMs', 'Speech-to-text'],
    description:
      'An AI tool that listens to spoken language and coaches fluency and pronunciation, turning live speech into targeted feedback.',
    highlights: [
      'Speech-to-text pipeline feeding an LLM feedback loop',
      'Real-time pronunciation and fluency scoring',
    ],
    links: [],
    draft: true,
  },
  {
    id: 'kodean',
    name: 'Kodean',
    tagline: 'A hands-on platform for learning to code',
    role: 'Founder · Full-stack',
    year: '2023',
    stack: ['Next.js', 'TypeScript', 'Node', 'PostgreSQL'],
    description:
      'A platform for learning to code through structured, hands-on lessons that keep learners writing real code from the first minute.',
    highlights: [
      'Interactive lesson flow on a Next.js + Node stack',
      'Progress and content modelled in PostgreSQL',
    ],
    links: [],
    draft: true,
  },
  {
    id: 'candidate-intake',
    name: 'Candidate Intake',
    tagline: 'Video-interview intake with on-device AI transcription & scoring',
    role: 'Solo — React Native',
    year: '2025',
    stack: ['React Native', 'Expo', 'Groq (Whisper)', 'Llama', 'TypeScript'],
    description:
      'A React Native app that captures candidate intro videos, transcribes them with Groq-hosted Whisper, and uses Llama to summarise and surface signal for reviewers — a real, shipped mobile AI pipeline.',
    highlights: [
      'End-to-end mobile capture → Whisper transcription → Llama summarisation',
      'Runs entirely on Expo; no custom native code required',
    ],
    links: [],
    draft: false,
  },
  {
    id: 'portfolio-app',
    name: 'This App',
    tagline: 'The portfolio you’re holding — a React Native experience, not a website',
    role: 'Solo — Design & Engineering',
    year: '2026',
    stack: ['React Native', 'Expo Router', 'Reanimated 4', 'Clerk', 'Stripe'],
    description:
      'A portfolio built as a native mobile app: real Clerk auth doubling as a designed onboarding, an animation-heavy showcase, and a Stripe “buy me a coffee” close — all in a graded cinematic dark theme.',
    highlights: [
      'Reverse-scroll, momentum-scroll, shared-element morphs & gesture-physics deck',
      'Real auth + real payments — full-stack, not just UI polish',
    ],
    links: [],
    draft: false,
  },
];

/** Lookup helper for detail screens. */
export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
