import type { AppointmentWithTherapy } from "@/lib/db/types";
import { CLINIC_TIME_ZONE } from "./schedule";
import { COUNTED_STATUSES } from "./status";
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
  /** The therapy with the most upcoming bookings; `null` if none or tied. */
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
 * Summarizes a schedule for the dashboard's overview strip. Only bookings
 * that are (or were) real visits count: cancelled and no-show bookings are
 * left out.
 *
 * @param schedule - Output of {@link splitSchedule}.
 * @param now - The same time the schedule was split at.
 * @param timeZone - Zone that decides which bookings are "today".
 */
export function summarizeSchedule(
  schedule: Schedule,
  now: Date,
  timeZone: string = CLINIC_TIME_ZONE,
): ScheduleOverview {
  const dayKey = (instant: number) =>
    JSON.stringify(zonedDate(instant, timeZone));
  const today = dayKey(now.getTime());
  const counted = (list: readonly AppointmentWithTherapy[]) =>
    list.filter((a) => COUNTED_STATUSES.includes(a.status));
  const upcoming = counted(schedule.upcoming);
  const past = counted(schedule.past);

  return {
    today: [...upcoming, ...past].filter(
      (a) => dayKey(Date.parse(a.startsAt)) === today,
    ).length,
    upcoming: upcoming.length,
    busiestTherapy: findBusiestTherapy(upcoming),
  };
}

/**
 * The therapy with the most of these bookings. Counted by id, since names
 * aren't unique. A tie has no single busiest therapy, so it returns `null`
 * rather than picking one arbitrarily.
 */
function findBusiestTherapy(
  appointments: readonly AppointmentWithTherapy[],
): ScheduleOverview["busiestTherapy"] {
  const counts = new Map<number, { name: string; count: number }>();
  for (const { therapy } of appointments) {
    const entry = counts.get(therapy.id) ?? { name: therapy.name, count: 0 };
    entry.count += 1;
    counts.set(therapy.id, entry);
  }
  const [first, second] = [...counts.values()].sort(
    (a, b) => b.count - a.count,
  );
  return first && first.count !== second?.count ? first : null;
}
