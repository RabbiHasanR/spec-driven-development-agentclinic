import type {
  ailments,
  APPOINTMENT_STATUSES,
  appointments,
  therapies,
} from "./schema";

// View-facing row types. UI code imports these instead of the schema, so
// tables can gain internal columns without leaking them into components.

export type Ailment = typeof ailments.$inferSelect;
export type Therapy = typeof therapies.$inferSelect;
export type AilmentWithTherapies = Ailment & { therapies: Therapy[] };
export type Appointment = typeof appointments.$inferSelect;
export type AppointmentWithTherapy = Appointment & { therapy: Therapy };
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** An ailment's editable fields, as staff save them. */
export type AilmentFields = Pick<Ailment, "name" | "summary" | "description">;
/** An ailment's fields plus the ids of the therapies that treat it. */
export type AilmentInput = AilmentFields & { therapyIds: number[] };
/** A therapy's editable fields, as staff save them. */
export type TherapyFields = Pick<
  Therapy,
  "name" | "summary" | "durationMinutes"
>;

/** Saving a catalog entry: the saved row, or why it couldn't be saved. */
export type SaveResult<T> =
  { ok: true; value: T } | { ok: false; reason: "name-taken" };
