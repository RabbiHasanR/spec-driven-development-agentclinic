import type { AilmentWithTherapies, Therapy } from "@/lib/db/schema";

export const THERAPY: Therapy = {
  id: 1,
  slug: "grounding-session",
  name: "Grounding Session",
  summary: "Reconnect with your sources.",
  durationMinutes: 30,
};

export const AILMENT: AilmentWithTherapies = {
  id: 1,
  slug: "hallucination-anxiety",
  name: "Hallucination Anxiety",
  summary: "Fear of citing papers that don't exist.",
  description: "A persistent worry that every confident answer is made up.",
  therapies: [THERAPY],
};
