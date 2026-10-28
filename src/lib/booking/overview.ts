import type { AppointmentWithTherapy } from "@/lib/db/types";
import { CLINIC_TIME_ZONE } from "./schedule";
import { zonedDate } from "./zoned-time";

/** Bookings split around now: next one first, and most recent past first. */
export type Schedule = {
  upcoming: AppointmentWithTherapy[];
  past: AppointmentWithTherapy[];
};

/** Headline numbers for the staff dashboard. */
export type ScheduleOverview = {
  /** Bookings on today's clinic date, including ones already over. */
  today: number;
  upcoming: number;
  /** The therapy with the most upcoming bookings; ties go to the first booked. */
  busiestTherapy: { name: string; count: number } | null;
};

/**
 * Splits bookings into upcoming and past.
 *
 * @param appointments - Bookings, earliest first.
 * @param now - The current time; tests pass a fixed clock.
 */
export function splitSchedule(
  appointments: readonly AppointmentWithTherapy[],
  now: Date,
): Schedule {
  const nowIso = now.toISOString();
  return {
    upcoming: appointments.filter((a) => a.startsAt >= nowIso),
    past: appointments.filter((a) => a.startsAt < nowIso).reverse(),
  };
}

/**
 * Summarizes a schedule for the dashboard's overview strip.
 *
 * @param schedule - Output of {@link splitSchedule}.
 * @param now - The same time the schedule was split at.
 * @param timeZone - Zone that decides which bookings are "today".
 */
export function summarizeSchedule(
  { upcoming, past }: Schedule,
  now: Date,
  timeZone: string = CLINIC_TIME_ZONE,
): ScheduleOverview {
  const dayKey = (instant: number) =>
    JSON.stringify(zonedDate(instant, timeZone));
  const today = dayKey(now.getTime());

  const counts = new Map<string, number>();
  for (const { therapy } of upcoming) {
    counts.set(therapy.name, (counts.get(therapy.name) ?? 0) + 1);
  }
  let busiestTherapy: ScheduleOverview["busiestTherapy"] = null;
  for (const [name, count] of counts) {
    if (!busiestTherapy || count > busiestTherapy.count) {
      busiestTherapy = { name, count };
    }
  }

  return {
    today: [...upcoming, ...past].filter(
      (a) => dayKey(Date.parse(a.startsAt)) === today,
    ).length,
    upcoming: upcoming.length,
    busiestTherapy,
  };
}
