// Wall-clock time in a named time zone, with no date library: Intl does the
// zone math, so DST changes are handled for any IANA zone.

/** A calendar date with a 1-based month. */
export type CalendarDate = { year: number; month: number; day: number };

type ZonedParts = CalendarDate & { hour: number; minute: number };

const formatters = new Map<string, Intl.DateTimeFormat>();

/** The wall-clock date and time of `instant` in `timeZone`. */
function zonedParts(instant: number, timeZone: string): ZonedParts {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
    formatters.set(timeZone, formatter);
  }
  const parts = Object.fromEntries(
    formatter.formatToParts(instant).map(({ type, value }) => [type, value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/** How far `timeZone` is ahead of UTC at `instant`, in milliseconds. */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const { year, month, day, hour, minute } = zonedParts(instant, timeZone);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  return wallAsUtc - (instant - (instant % 60_000));
}

/** Today's date in `timeZone` at `instant`. */
export function zonedDate(instant: number, timeZone: string): CalendarDate {
  const { year, month, day } = zonedParts(instant, timeZone);
  return { year, month, day };
}

/**
 * The UTC instant of a wall-clock hour on `date` in `timeZone`.
 *
 * @returns Milliseconds since the epoch.
 */
export function zonedHourToUtc(
  date: CalendarDate,
  hour: number,
  timeZone: string,
): number {
  const wall = Date.UTC(date.year, date.month - 1, date.day, hour);
  // The offset at the wall time can differ from the offset at the real
  // instant around a DST change, so correct once with the latter.
  const guess = wall - zoneOffsetMs(wall, timeZone);
  return wall - zoneOffsetMs(guess, timeZone);
}

/** `date` moved by `days` (negative goes back), and its day of the week. */
export function addDays(
  date: CalendarDate,
  days: number,
): CalendarDate & { weekday: number } {
  const moved = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return {
    year: moved.getUTCFullYear(),
    month: moved.getUTCMonth() + 1,
    day: moved.getUTCDate(),
    weekday: moved.getUTCDay(),
  };
}
