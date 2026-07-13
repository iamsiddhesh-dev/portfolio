/**
 * Portfolio content — the single source of project data. Every later phase
 * (reverse-scroll cards, card deck, detail morphs) reads from here, so nothing
 * downstream blocks on copy.
 *
 * ⚠️  Vibely and SpeakWell are still flagged `draft: true` — their copy is real
 *     but the owner is still refining it. The `draft` flag is internal tracking
 *     only and is NOT rendered. Every entry now carries real links, each with an
 *     `icon` key resolved to an image via `content/icons.ts`.
 */
import type { IconKey } from './icons';

export type ProjectLink = {
  label: string;
  url: string;
  /** Semantic icon key; resolved to an image asset by `content/icons.ts`. */
  icon: IconKey;
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
    id: "vibely",
    name: "Vibely",
    tagline:
      "Describe a landing page in one sentence. Get back a live, scroll-animated page.",
    role: "Solo Builder",
    year: "2026",
    stack: [
      "TanStack Start",
      "React 19",
      "TypeScript",
      "Google Gemini",
      "GSAP (ScrollTrigger, SplitText)",
      "Lenis",
      "Zod",
    ],
    description:
      "An AI agent that plans, writes copy for, and generates a complete scroll-animated landing page from a single prompt — no templates, every run produces a different layout, palette, and choreography. The core idea: a fixed runtime harness owns all the fragile scroll-engine code (Lenis, GSAP ticker, plugin registration), and the model is only ever allowed to choose from a closed vocabulary of 15 animation intents, each with its own contract and deterministic fallback. Inside those walls the model is fully free to invent layout, copy, and DOM structure.",
    highlights: [
      "Designed a 'closed vocabulary, open choreography' architecture so LLM-generated code can't break scroll-pin math or smooth-scroll integration",
      "Built a 6-stage pipeline (plan → copywrite → parallel per-section codegen → validate/auto-repair → assemble → live preview) instead of one whole-page generation call",
      "Every generated page degrades to a fully readable static page with JS off or reduced-motion set, without a separate code path",
      "Nothing hard-fails: bad JSON or bad generated code gets one auto-repair attempt, then falls back to a hand-written skeleton for that animation intent",
    ],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/iamsiddhesh-dev/Vibely",
        icon: "github",
      },
    ],
    draft: true,
  },
  {
    id: "speakwell",
    name: "SpeakWell",
    tagline:
      "Record yourself speaking. Get instant AI feedback. Improve faster.",
    role: "Solo Full-Stack Developer",
    year: "2026",
    stack: [
      "Next.js 16",
      "FastAPI",
      "Celery",
      "Redis",
      "Groq (Whisper large-v3 + Llama 3.3-70B)",
      "Supabase (Auth, Postgres, Storage)",
      "TypeScript",
      "Python",
    ],
    description:
      "A full-stack AI English speaking coach: you record yourself talking, and within 10-15 seconds get grammar corrections, filler-word detection, fluency/clarity/confidence scores, and both a corrected and a natural native-speaker rephrasing read back to you in audio. Built as an async, distributed pipeline — FastAPI queues the job and returns immediately, a Celery worker does the actual STT/analysis/TTS work off the request thread, and results are polled from the frontend.",
    highlights: [
      "Deployed and live at speakwell-live.vercel.app — Next.js frontend on Vercel, FastAPI/Celery/Redis backend on Railway",
      "Routed transcription through Groq-hosted Whisper instead of running it locally, sidestepping Railway's memory limits",
      "Used Supabase Storage instead of local disk to solve distributed-filesystem issues across Celery worker containers",
      "RMS energy check via Librosa rejects silent recordings before any AI call runs, saving wasted inference",
      "Built entirely under a zero-cost constraint — free-tier services end to end",
    ],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/iamsiddhesh-dev/speakwell",
        icon: "github",
      },
      {
        label: "Live Demo",
        url: "https://speakwell-live.vercel.app",
        icon: "demo",
      },
    ],
    draft: true,
  },
  {
    id: "kodean",
    name: "kodean",
    tagline: "Learn every line of AI-generated code.",
    role: "Solo Developer",
    year: "2026",
    stack: [
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "Vite",
      "Chrome Extension (Manifest V3)",
      "Cloudflare Workers",
    ],
    description:
      "A Chrome extension that sits between you and the AI-generated code you copy-paste from ChatGPT, Claude, or GitHub. Select any snippet on a supported site and it returns a structured breakdown — what it is, why it's used, common mistakes, real-world analogies — with inline follow-up questions. Anything you save enters a built-in spaced-repetition review queue (1 → 3 → 7 → 16 → 35 day intervals) so it actually sticks instead of getting forgotten.",
    highlights: [
      "Manifest V3 extension compiled into four independent Vite bundles, backed by a serverless Cloudflare Workers API",
      "Built a full spaced-repetition scheduler from scratch to drive the review queue",
      "Debugged and resolved a production 401 auth incident post-launch",
      "Established strict branching rules — feature branches, mandatory PRs for anything touching auth or secrets",
      "Wrote READMEs for both the extension and landing page repos, plus a Reddit post for early community feedback",
    ],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/iamsiddhesh-dev/kodean-chrome-extension",
        icon: "github",
      },
      {
        label: "Landing Page Repo",
        url: "https://github.com/iamsiddhesh-dev/kodean_landing_page",
        icon: "github",
      },
      {
        label: "Live Demo",
        url: "https://kodean.vercel.app",
        icon: "demo",
      },
    ],
    draft: false,
  },
  {
    id: "candidate-video-feature",
    name: "Candidate Video Feature",
    tagline: "Video-interview intake with confidence-gated founder visibility.",
    role: "Solo Developer",
    year: "2026",
    stack: [
      "React Native",
      "Expo",
      "Node / Express",
      "Groq (Whisper + Llama)",
      "ffmpeg",
    ],
    description:
      "A proof-of-concept startup-hiring feature: a candidate records a short video intro on their phone, an LLM extracts hiring signal from the transcript, and that signal enriches their resume with a confidence-scored summary for founders — with the candidate's actual video only surfacing once the confidence score clears a bar. Built and pitched end-to-end to a founder, from native camera capture through the founder-facing review view.",
    highlights: [
      "Built native camera capture in Expo/React Native, verified working on real Android and iOS devices via Expo Go with zero platform-specific code",
      "Backend strips video to audio via ffmpeg before transcription, keeping uploads small and fast",
      "Conservative LLM extraction pipeline designed to never invent facts not present in the transcript",
      "Confidence-gated founder view: summary and score always visible, raw video only surfaces above the confidence threshold",
      "Pitched the working feature directly to a founder, with LinkedIn outreach drafted around it",
    ],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/iamsiddhesh-dev/candidate-video-feature",
        icon: "github",
      },
    ],
    draft: false,
  },
  {
    id: "onboarding-copilot",
    name: "Onboarding Copilot",
    tagline:
      "Found 3 real bugs in a customer's onboarding flow, fixed them, then shipped an AI autofill on top.",
    role: "Forward Deployed Engineer",
    year: "2026",
    stack: [
      "FastAPI",
      "SQLAlchemy",
      "SQLite",
      "Groq (Llama 3.3-70B)",
      "Docker / Docker Compose",
      "Vanilla HTML/CSS/JS",
    ],
    description:
      "A fixed, AI-augmented rebuild of a real profile-completion onboarding step, built to demonstrate the loop a Forward Deployed Engineer lives in: find a real problem in a customer's product, fix it, extend it with an AI integration, and ship it running. While completing his own profile on a live onboarding wizard, found 3 genuine bugs — rather than filing a bug list, rebuilt the entire flow with a live Before/After toggle reproducing and fixing each one, then extended the form with an 'Autofill with AI' feature that reads a résumé and fills the fields automatically.",
    highlights: [
      "Fixed 3 real production bugs: duplicate-tag state bugs in Industries and Job Titles (value-keyed state → unique instance IDs), and an unenforced 10-skill cap",
      "Single Docker container serves both the REST API and static frontend from one origin — zero-config, one command to run",
      "AI autofill via Groq Llama 3.3-70B in JSON mode, deliberately excluding Job Titles/Years of Experience since those are candidate decisions, not AI guesses",
      "Zero-API-key demo path: falls back to a realistic mocked response if no Groq key is set, so it never breaks for a reviewer",
      "Defense-in-depth validation — every cap and dedupe rule enforced server-side regardless of what the LLM returns",
      "Full Postman collection, Newman-verified, covering every endpoint",
    ],
    links: [
      {
        label: "GitHub",
        url: "https://github.com/iamsiddhesh-dev/onboarding-copilot",
        icon: "github",
      },
      {
        label: "Live Demo",
        url: "https://onboarding-copilot-live.vercel.app",
        icon: "demo",
      },
    ],
    draft: false,
  },
];

/** Lookup helper for detail screens. */
export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
