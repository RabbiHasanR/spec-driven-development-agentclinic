import { asc, eq } from "drizzle-orm";
import { generateReference as defaultGenerateReference } from "@/lib/booking/reference";
import { generateSlots } from "@/lib/booking/slots";
import type { BookingInput } from "@/lib/booking/validate";
import type { Db } from "./connection";
import { appointments, therapies } from "./schema";
import type { AppointmentWithTherapy, Therapy } from "./types";

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
 */
function isUniqueViolation(error: unknown, column: string): boolean {
  return (
    error instanceof Error &&
    (error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE" &&
    error.message.includes(column)
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
 * A therapy's bookable start times right now: its generated slots minus the
 * booked ones.
 */
export function listOpenSlots(db: Db, therapy: Therapy, now: Date): string[] {
  const booked = new Set(listBookedSlots(db, therapy.id));
  return generateSlots(now, therapy.durationMinutes).filter(
    (slot) => !booked.has(slot),
  );
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
  input: BookingInput,
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
