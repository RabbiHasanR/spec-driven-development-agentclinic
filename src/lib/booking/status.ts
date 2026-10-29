// Booking status rules: which changes staff may make, and how statuses read.

import type { Appointment, AppointmentStatus } from "@/lib/db/types";

/** Statuses staff can move a booking to; `booked` is only the starting one. */
export const STATUS_CHANGES = [
  "attended",
  "no_show",
  "cancelled",
] as const satisfies readonly AppointmentStatus[];

export type StatusChange = (typeof STATUS_CHANGES)[number];

/** Every status as a short label, e.g. for badges. */
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  booked: "Booked",
  attended: "Attended",
  no_show: "No-show",
  cancelled: "Cancelled",
};

/** Every status in a sentence: "This booking was cancelled". */
export const STATUS_SENTENCES: Record<AppointmentStatus, string> = {
  booked: "is booked",
  attended: "was marked attended",
  no_show: "was marked a no-show",
  cancelled: "was cancelled",
};

/** The button text for each change. */
export const CHANGE_LABELS: Record<StatusChange, string> = {
  attended: "Mark attended",
  no_show: "Mark no-show",
  cancelled: "Cancel booking",
};

/** Statuses that count as real visits in the dashboard's overview. */
export const COUNTED_STATUSES: readonly AppointmentStatus[] = [
  "booked",
  "attended",
];

type BookingState = Pick<Appointment, "status" | "startsAt">;

/**
 * The status changes staff may make to a booking right now.
 *
 * - A `booked` booking can be cancelled until its slot starts.
 * - Once it has started, it can be marked `attended` or `no_show`.
 * - `attended`, `no_show`, and `cancelled` are final: no changes.
 *
 * @param appointment - The booking's current status and start time.
 * @param now - The current time; tests pass a fixed clock.
 */
export function allowedChanges(
  { status, startsAt }: BookingState,
  now: Date,
): StatusChange[] {
  if (status !== "booked") return [];
  return hasStarted(startsAt, now) ? ["attended", "no_show"] : ["cancelled"];
}

/**
 * Why a change isn't allowed right now, in words staff can act on. Covers
 * the usual causes: the clock moved past the start, or someone else already
 * changed the booking.
 *
 * @param appointment - The booking as it is now.
 * @param change - The change that was refused.
 * @param now - The current time.
 */
export function whyChangeNotAllowed(
  appointment: BookingState,
  change: StatusChange,
  now: Date,
): string {
  if (appointment.status !== "booked") {
    return `This booking ${STATUS_SENTENCES[appointment.status]}, so it can’t change any more.`;
  }
  return hasStarted(appointment.startsAt, now)
    ? "This appointment has started, so it can’t be cancelled. Mark it attended or a no-show instead."
    : `This appointment hasn’t started yet, so it can’t be ${change === "attended" ? "marked attended" : "marked a no-show"}.`;
}

/** Narrows a submitted form value to a status change, if it is one. */
export function parseStatusChange(value: unknown): StatusChange | undefined {
  return STATUS_CHANGES.find((change) => change === value);
}

function hasStarted(startsAt: string, now: Date): boolean {
  return now.toISOString() >= startsAt;
}
