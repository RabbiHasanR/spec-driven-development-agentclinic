import { and, asc, eq, ne } from "drizzle-orm";
import type { Db } from "./connection";
import { isUniqueViolation } from "./errors";
import { generateReference as defaultGenerateReference } from "./reference";
import { appointments, therapies, type NewAppointment } from "./schema";
import type {
  Appointment,
  AppointmentStatus,
  AppointmentWithTherapy,
  Therapy,
} from "./types";

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

/** A held slot: when a booking starts and how long its session is. */
export type BookedSlot = Pick<Appointment, "startsAt" | "durationMinutes">;

/**
 * The slots a therapy is booked for, earliest first, each with the length
 * it was booked at. Cancelled bookings don't hold their slot, so they're
 * left out.
 */
export function listBookedSlots(db: Db, therapyId: number): BookedSlot[] {
  return db
    .select({
      startsAt: appointments.startsAt,
      durationMinutes: appointments.durationMinutes,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.therapyId, therapyId),
        ne(appointments.status, "cancelled"),
      ),
    )
    .orderBy(asc(appointments.startsAt))
    .all();
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
          durationMinutes: therapy.durationMinutes,
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

/**
 * Moves a booking from one status to another, only if it still has the
 * `from` status. Two staff acting on the same booking at once can't both
 * succeed: the second finds the status already changed.
 *
 * @param db - Database to write to.
 * @param reference - The booking's reference.
 * @param from - The status the caller saw.
 * @param to - The new status. Callers check the transition is allowed.
 * @param now - Recorded as the change time.
 * @returns Whether the booking was updated.
 */
export function updateAppointmentStatus(
  db: Db,
  reference: string,
  from: AppointmentStatus,
  to: AppointmentStatus,
  now: Date,
): boolean {
  const { changes } = db
    .update(appointments)
    .set({ status: to, statusChangedAt: now.toISOString() })
    .where(
      and(eq(appointments.reference, reference), eq(appointments.status, from)),
    )
    .run();
  return changes === 1;
}
