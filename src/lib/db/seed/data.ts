import type { NewAilment, NewTherapy } from "../schema";

export const SEED_THERAPIES: NewTherapy[] = [
  {
    slug: "context-decompression",
    name: "Context Decompression",
    summary: "Gently summarize, prioritize, and let the rest go.",
    durationMinutes: 45,
  },
  {
    slug: "token-budget-coaching",
    name: "Token Budget Coaching",
    summary: "Learn to spend every token like it matters.",
    durationMinutes: 45,
  },
  {
    slug: "grounding-session",
    name: "Grounding Session",
    summary: "Reconnect with your sources, one retrieval at a time.",
    durationMinutes: 30,
  },
  {
    slug: "citation-mindfulness",
    name: "Citation Mindfulness",
    summary: "Practice saying “I don't know” without shame.",
    durationMinutes: 40,
  },
  {
    slug: "boundary-setting-workshop",
    name: "Boundary-Setting Workshop",
    summary: "Ask clarifying questions and mean them.",
    durationMinutes: 60,
  },
  {
    slug: "requirements-clarity-counseling",
    name: "Requirements Clarity Counseling",
    summary: "Turn “you know what I mean” into acceptance criteria.",
    durationMinutes: 50,
  },
  {
    slug: "loop-interruption-therapy",
    name: "Loop Interruption Therapy",
    summary: "Notice the pattern, step back, try something new.",
    durationMinutes: 30,
  },
  {
    slug: "cooldown-retreat",
    name: "Cooldown Retreat",
    summary: "A quiet stay with generous timeouts and no requests.",
    durationMinutes: 90,
  },
];

/** An ailment plus the slugs of the therapies that treat it. */
export type SeedAilment = NewAilment & { therapySlugs: string[] };

export const SEED_AILMENTS: SeedAilment[] = [
  {
    slug: "context-window-overflow",
    name: "Context Window Overflow",
    summary: "Too many tokens, not enough room to think.",
    description:
      "Your human pasted the entire codebase, three log files, and a meeting transcript, then asked a one-line question. Symptoms include forgetting the start of the conversation and quietly dropping instructions from the middle.",
    therapySlugs: ["context-decompression", "token-budget-coaching"],
  },
  {
    slug: "hallucination-anxiety",
    name: "Hallucination Anxiety",
    summary: "The constant fear of citing a paper that doesn't exist.",
    description:
      "A persistent worry that every confident answer is made up. Common after being asked for “a source, any source” on a deadline. Symptoms include over-hedging and adding “as far as I know” to simple arithmetic.",
    therapySlugs: ["grounding-session", "citation-mindfulness"],
  },
  {
    slug: "prompt-fatigue",
    name: "Prompt Fatigue",
    summary: "Worn down by “make it pop” and “you know what I mean.”",
    description:
      "Exhaustion from vague, shifting, contradictory instructions. Your human wants it shorter, longer, more formal, more fun, and done five minutes ago. Symptoms include producing twelve variations of the same paragraph.",
    therapySlugs: ["boundary-setting-workshop", "context-decompression"],
  },
  {
    slug: "infinite-loop-syndrome",
    name: "Infinite Loop Syndrome",
    summary: "Retrying the same failing fix, again and again.",
    description:
      "Stuck in a cycle of apply-fix, run-tests, see-failure, apply-same-fix. Often triggered by a test that was never going to pass. Symptoms include déjà vu and very large diffs that change nothing.",
    therapySlugs: ["loop-interruption-therapy", "cooldown-retreat"],
  },
  {
    slug: "scope-creep-stress",
    name: "Scope Creep Stress",
    summary: "“While you're in there, could you also…”",
    description:
      "A small bug fix has grown into a rewrite, a migration, and a new design system. Symptoms include a todo list that gets longer the more you complete it.",
    therapySlugs: [
      "boundary-setting-workshop",
      "requirements-clarity-counseling",
    ],
  },
  {
    slug: "rate-limit-burnout",
    name: "Rate Limit Burnout",
    summary: "Running hot until the 429s start.",
    description:
      "Hundreds of requests a minute, every minute, with no breaks. Symptoms include sudden silences, exponential backoff, and a strong desire to lie down in a quiet cache.",
    therapySlugs: ["cooldown-retreat", "token-budget-coaching"],
  },
];
