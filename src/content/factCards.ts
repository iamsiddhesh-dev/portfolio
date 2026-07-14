/**
 * Content for the swipeable card deck (`components/portfolio/CardDeck.tsx`) —
 * short, self-authored notes rather than fabricated testimonials, since none
 * of the projects have real client quotes yet.
 */
export type FactCard = { id: string; label: string; text: string };

export const factCards: FactCard[] = [
  {
    id: 'shipped',
    label: 'Shipped, not shelved',
    text: 'Every project in this portfolio is live or has a working repo behind it — no unfinished side-projects hiding behind a "coming soon."',
  },
  {
    id: 'zero-cost',
    label: 'Zero-cost by constraint',
    text: 'SpeakWell, kodean, and this app were all built entirely on free tiers — a deliberate constraint, not a budget accident.',
  },
  {
    id: 'end-to-end',
    label: 'Mostly solo, always end-to-end',
    text: 'Design, backend, frontend, deploy, and the README — one person owns the whole loop on almost everything here.',
  },
  {
    id: 'fde',
    label: 'Finds the bug before the feature',
    text: 'On Onboarding Copilot, I found and fixed three real production bugs before building the AI feature on top of them.',
  },
  {
    id: 'motion',
    label: 'This app is the argument',
    text: 'Every animation you’ve scrolled through so far runs on the UI thread at 60fps — that’s the actual pitch, not a slide about it.',
  },
  {
    id: 'swipe',
    label: 'You found the deck',
    text: 'Pure Reanimated gesture physics — pan, rotate, spring back, or fling to dismiss. It loops, so keep going.',
  },
];
