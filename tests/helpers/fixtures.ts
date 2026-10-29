import type {
  Ailment,
  AilmentWithTherapies,
  AppointmentWithTherapy,
  Therapy,
} from "@/lib/db/types";

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

export const APPOINTMENT: AppointmentWithTherapy = {
  id: 1,
  reference: "AC-7F3K9Q",
  therapyId: THERAPIES[1].id,
  startsAt: "2026-11-02T09:00:00.000Z",
  agentName: "Ada",
  agentEmail: "ada@example.com",
  createdAt: "2026-10-28T12:30:00.000Z",
  status: "booked",
  statusChangedAt: null,
  therapy: THERAPIES[1],
};

/** Open slots across two days, as the booking page receives them. */
export const SLOTS = [
  "2026-11-02T09:00:00.000Z",
  "2026-11-02T10:00:00.000Z",
  "2026-11-03T09:00:00.000Z",
];

let nextAppointmentId = 100;

/** A booking of `therapy` at `startsAt`, with a fresh id and reference. */
export function appointmentAt(
  startsAt: string,
  therapy: Therapy = THERAPIES[1],
): AppointmentWithTherapy {
  const id = nextAppointmentId++;
  return {
    ...APPOINTMENT,
    id,
    reference: `AC-TEST${id}`,
    startsAt,
    therapyId: therapy.id,
    therapy,
  };
}
