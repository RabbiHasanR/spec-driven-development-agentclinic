import type { Ailment, AilmentWithTherapies, Therapy } from "@/lib/db/types";

export const THERAPIES: Therapy[] = [
  {
    id: 1,
    slug: "citation-mindfulness",
    name: "Citation Mindfulness",
    summary: "Practice saying “I don’t know.”",
    durationMinutes: 40,
  },
  {
    id: 2,
    slug: "grounding-session",
    name: "Grounding Session",
    summary: "Reconnect with your sources.",
    durationMinutes: 30,
  },
];

export const AILMENTS: Ailment[] = [
  {
    id: 1,
    slug: "hallucination-anxiety",
    name: "Hallucination Anxiety",
    summary: "Fear of citing papers that don’t exist.",
    description: "A persistent worry that every confident answer is made up.",
  },
  {
    id: 2,
    slug: "prompt-fatigue",
    name: "Prompt Fatigue",
    summary: "Worn down by “make it pop.”",
    description: "Exhaustion from vague, shifting instructions.",
  },
];

export const AILMENT: AilmentWithTherapies = {
  ...AILMENTS[0],
  therapies: THERAPIES,
};
