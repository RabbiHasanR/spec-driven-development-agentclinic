import type { BookedSlot } from "@/lib/db/appointments";
import {
  BOOKING_WINDOW_DAYS,
  CLINIC_DAYS,
  CLINIC_TIME_ZONE,
  CLOSING_HOUR,
  OPENING_HOUR,
} from "./schedule";
import { addDays, zonedDate, zonedHourToUtc } from "./zoned-time";

/**
 * Every bookable start time for a therapy, before removing booked ones.
 *
 * Slots start on the hour from opening time, on clinic days within the
 * booking window, and strictly after `now`. They're spaced by the session
 * length rounded up to whole hours and every session ends by closing time,
 * so a therapist's sessions never overlap.
 *
 * @param now - The current time; tests pass a fixed clock.
 * @param durationMinutes - The therapy's session length.
 * @param timeZone - Zone the opening hours are in.
 * @returns Start times as ISO 8601 UTC strings, earliest first.
 */
export function generateSlots(
  now: Date,
  durationMinutes: number,
  timeZone: string = CLINIC_TIME_ZONE,
): string[] {
  const stepHours = Math.max(1, Math.ceil(durationMinutes / 60));
  const today = zonedDate(now.getTime(), timeZone);
  const slots: string[] = [];

  for (let offset = 0; offset < BOOKING_WINDOW_DAYS; offset++) {
    const date = addDays(today, offset);
    if (!CLINIC_DAYS.includes(date.weekday)) continue;

    for (
      let hour = OPENING_HOUR;
      hour * 60 + durationMinutes <= CLOSING_HOUR * 60;
      hour += stepHours
    ) {
      const startsAt = zonedHourToUtc(date, hour, timeZone);
      if (startsAt > now.getTime()) {
        slots.push(new Date(startsAt).toISOString());
      }
    }
  }
  return slots;
}

const MINUTE_MS = 60_000;

/**
 * Removes slots whose session would overlap a booked one. Compares time
 * ranges, each booking using the length it was booked at, so changing a
 * therapy's length (longer or shorter) never lets sessions overlap.
 *
 * @param slots - Candidate start times (ISO UTC), e.g. from {@link generateSlots}.
 * @param booked - Bookings already held for the same therapy.
 * @param durationMinutes - The therapy's current length, for new sessions.
 * @returns The slots that are still free, in their original order.
 */
export function removeBookedSlots(
  slots: readonly string[],
  booked: readonly BookedSlot[],
  durationMinutes: number,
): string[] {
  const length = durationMinutes * MINUTE_MS;
  const ranges = booked.map((b) => {
    const start = Date.parse(b.startsAt);
    return { start, end: start + b.durationMinutes * MINUTE_MS };
  });
  return slots.filter((slot) => {
    const start = Date.parse(slot);
    const end = start + length;
    return ranges.every((other) => end <= other.start || other.end <= start);
  });
}
