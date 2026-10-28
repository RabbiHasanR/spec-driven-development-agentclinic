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
