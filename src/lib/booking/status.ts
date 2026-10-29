// Booking status rules: which changes staff may make, and how statuses read.

import type { Appointment, AppointmentStatus } from "@/lib/db/types";

/** Statuses staff can move a booking to; `booked` is only the starting one. */
export type StatusChange = Exclude<AppointmentStatus, "booked">;

/** Every status, as staff and agents read it. */
export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  booked: "Booked",
  attended: "Attended",
  no_show: "No-show",
  cancelled: "Cancelled",
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
export function allowedTransitions(
  { status, startsAt }: Pick<Appointment, "status" | "startsAt">,
  now: Date,
): StatusChange[] {
  if (status !== "booked") return [];
  return now.toISOString() < startsAt ? ["cancelled"] : ["attended", "no_show"];
}

/** Narrows a submitted form value to a status change, if it is one. */
export function parseStatusChange(value: unknown): StatusChange | undefined {
  return typeof value === "string" && Object.hasOwn(CHANGE_LABELS, value)
    ? (value as StatusChange)
    : undefined;
}
