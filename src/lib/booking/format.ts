import { CLINIC_TIME_ZONE } from "./schedule";

// Fixed locale and zone, so server and client render the same text.
const LOCALE = "en-GB";

const DAY = new Intl.DateTimeFormat(LOCALE, {
  timeZone: CLINIC_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

const TIME = new Intl.DateTimeFormat(LOCALE, {
  timeZone: CLINIC_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

const ZONE = new Intl.DateTimeFormat(LOCALE, {
  timeZone: CLINIC_TIME_ZONE,
  timeZoneName: "short",
});

/** A slot's day in clinic time, e.g. "Monday 2 November". */
export function formatSlotDay(iso: string): string {
  return DAY.format(new Date(iso));
}

/** A slot's start time in clinic time, e.g. "09:00". */
export function formatSlotTime(iso: string): string {
  return TIME.format(new Date(iso));
}

/** The clinic's short time zone name at `iso`, e.g. "UTC" or "GMT+6". */
export function formatZone(iso: string): string {
  return (
    ZONE.formatToParts(new Date(iso)).find(
      (part) => part.type === "timeZoneName",
    )?.value ?? CLINIC_TIME_ZONE
  );
}

/** A slot's full date and time with the zone, e.g. "Monday 2 November, 09:00 UTC". */
export function formatSlot(iso: string): string {
  return `${formatSlotDay(iso)}, ${formatSlotTime(iso)} ${formatZone(iso)}`;
}

/** Slots on one clinic day. */
export type SlotDay = {
  day: string;
  slots: { value: string; label: string }[];
};

/** Groups ISO slot times by clinic day, keeping their order. */
export function groupSlotsByDay(slots: readonly string[]): SlotDay[] {
  const days: SlotDay[] = [];
  for (const value of slots) {
    const day = formatSlotDay(value);
    const slot = { value, label: formatSlotTime(value) };
    if (days.at(-1)?.day === day) days.at(-1)!.slots.push(slot);
    else days.push({ day, slots: [slot] });
  }
  return days;
}
