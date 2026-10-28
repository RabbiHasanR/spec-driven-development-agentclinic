import { asc, eq } from "drizzle-orm";
import type { Db } from "./connection";
import { generateReference as defaultGenerateReference } from "./reference";
import { appointments, therapies, type NewAppointment } from "./schema";
import type { AppointmentWithTherapy, Therapy } from "./types";

/** The fields a caller supplies for a new booking; the rest are generated. */
export type NewBooking = Pick<
  NewAppointment,
  "agentName" | "agentEmail" | "startsAt"
>;

/** Attempts at a fresh reference before giving up; a clash is very rare. */
const MAX_REFERENCE_ATTEMPTS = 5;

export type CreateAppointmentResult =
  | { ok: true; appointment: AppointmentWithTherapy }
  | { ok: false; reason: "slot-taken" };

/**
 * Whether `error` is SQLite rejecting a duplicate in `table.column`.
 *
 * The message names every column of the violated index, e.g.
 * "UNIQUE constraint failed: appointments.therapy_id, appointments.starts_at".
 * Drizzle throws the driver's error as-is here, but some of its sessions wrap
 * it in a `DrizzleQueryError` with the original as `cause`; both are handled.
 */
export function isUniqueViolation(error: unknown, column: string): boolean {
  const cause = error instanceof Error && error.cause ? error.cause : error;
  return (
    cause instanceof Error &&
    (cause as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE" &&
    cause.message.includes(column)
  );
}

/** Start times already booked for a therapy, earliest first. */
export function listBookedSlots(db: Db, therapyId: number): string[] {
  return db
    .select({ startsAt: appointments.startsAt })
    .from(appointments)
    .where(eq(appointments.therapyId, therapyId))
    .orderBy(asc(appointments.startsAt))
    .all()
    .map(({ startsAt }) => startsAt);
}

/**
 * Books a slot. The database's unique `(therapy_id, starts_at)` index decides
 * races, so of two concurrent bookings for one slot exactly one succeeds.
 *
 * @param db - Database to write to.
 * @param therapy - The therapy being booked.
 * @param input - Validated booking fields.
 * @param options.now - Creation time; tests pass a fixed clock.
 * @param options.generateReference - Reference source; tests can force clashes.
 * @returns The new appointment, or `slot-taken` if the slot is already booked.
 * @throws Error if no unused reference is found, or on any other DB error.
 */
export function createAppointment(
  db: Db,
  therapy: Therapy,
  input: NewBooking,
  {
    now = new Date(),
    generateReference = defaultGenerateReference,
  }: { now?: Date; generateReference?: () => string } = {},
): CreateAppointmentResult {
  for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt++) {
    try {
      const appointment = db
        .insert(appointments)
        .values({
          ...input,
          reference: generateReference(),
          therapyId: therapy.id,
          createdAt: now.toISOString(),
        })
        .returning()
        .get();
      return { ok: true, appointment: { ...appointment, therapy } };
    } catch (error) {
      if (isUniqueViolation(error, "appointments.starts_at")) {
        return { ok: false, reason: "slot-taken" };
      }
      if (!isUniqueViolation(error, "appointments.reference")) throw error;
    }
  }
  throw new Error("Couldn't generate an unused booking reference.");
}

/**
 * Finds a booking by its public reference, with its therapy.
 *
 * @returns The booking, or `undefined` if no booking has that reference.
 */
export function getAppointmentByReference(
  db: Db,
  reference: string,
): AppointmentWithTherapy | undefined {
  const row = db
    .select()
    .from(appointments)
    .innerJoin(therapies, eq(appointments.therapyId, therapies.id))
    .where(eq(appointments.reference, reference))
    .get();
  return row && { ...row.appointments, therapy: row.therapies };
}

/** Every booking with its therapy, earliest first. */
export function listAppointments(db: Db): AppointmentWithTherapy[] {
  return db
    .select()
    .from(appointments)
    .innerJoin(therapies, eq(appointments.therapyId, therapies.id))
    .orderBy(asc(appointments.startsAt))
    .all()
    .map((row) => ({ ...row.appointments, therapy: row.therapies }));
}
