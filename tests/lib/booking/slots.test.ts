// @vitest-environment node
import { describe, expect, it } from "vitest";
import { generateSlots, removeBookedSlots } from "@/lib/booking/slots";

// Wednesday 28 October 2026, 12:30 UTC.
const NOW = new Date("2026-10-28T12:30:00.000Z");

const hoursOf = (slots: string[], day: string) =>
  slots
    .filter((slot) => slot.startsWith(day))
    .map((slot) => slot.slice(11, 16));

describe("generateSlots", () => {
  it("offers hourly slots 09:00–16:00 on weekdays for sessions up to an hour", () => {
    const slots = generateSlots(NOW, 30, "UTC");

    expect(hoursOf(slots, "2026-10-29")).toEqual([
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ]);
  });

  it("spaces longer sessions so they never overlap and end by closing", () => {
    const slots = generateSlots(NOW, 90, "UTC");

    expect(hoursOf(slots, "2026-10-29")).toEqual([
      "09:00",
      "11:00",
      "13:00",
      "15:00",
    ]);
  });

  it("only offers times after now", () => {
    const slots = generateSlots(NOW, 30, "UTC");

    expect(slots[0]).toBe("2026-10-28T13:00:00.000Z");
    expect(
      generateSlots(new Date("2026-10-28T13:00:00.000Z"), 30, "UTC")[0],
    ).toBe("2026-10-28T14:00:00.000Z");
  });

  it("skips weekends", () => {
    const slots = generateSlots(NOW, 30, "UTC");

    expect(hoursOf(slots, "2026-10-31")).toEqual([]);
    expect(hoursOf(slots, "2026-11-01")).toEqual([]);
  });

  it("covers the next 14 days, today included", () => {
    const slots = generateSlots(NOW, 30, "UTC");

    expect(slots.at(-1)).toBe("2026-11-10T16:00:00.000Z");
    // 4 left today, then 9 more weekdays of 8 slots.
    expect(slots).toHaveLength(4 + 9 * 8);
  });

  it("returns slots earliest first", () => {
    const slots = generateSlots(NOW, 45, "UTC");

    expect(slots).toEqual([...slots].sort());
  });

  it("uses opening hours in the clinic's time zone", () => {
    // 12:30 UTC is 18:30 in Dhaka (UTC+6), so today is over there.
    const slots = generateSlots(NOW, 30, "Asia/Dhaka");

    expect(slots[0]).toBe("2026-10-29T03:00:00.000Z");
  });

  it("keeps 09:00 local across a daylight saving change", () => {
    // New York leaves daylight saving time on Sunday 1 November 2026.
    const slots = generateSlots(NOW, 30, "America/New_York");

    expect(slots).toContain("2026-10-30T13:00:00.000Z"); // 09:00 EDT
    expect(slots).toContain("2026-11-02T14:00:00.000Z"); // 09:00 EST
  });
});

describe("removeBookedSlots", () => {
  const at = (time: string) => `2026-11-02T${time}:00.000Z`;
  const HOURS = ["09:00", "10:00", "11:00", "12:00"].map(at);

  it("removes a booked slot", () => {
    expect(removeBookedSlots(HOURS, [at("10:00")], 60)).toEqual([
      at("09:00"),
      at("11:00"),
      at("12:00"),
    ]);
  });

  it("keeps slots that only touch a booking", () => {
    expect(
      removeBookedSlots([at("09:00"), at("11:00")], [at("10:00")], 60),
    ).toEqual([at("09:00"), at("11:00")]);
  });

  it("removes every slot a booking overlaps after the session got longer", () => {
    // Booked at 10:00 when the therapy was an hour; it's now 90 minutes, so
    // 09:00–10:30 and 11:00–12:30 would both overlap 10:00–11:30.
    const slots = [at("09:00"), at("11:00"), at("13:00")];

    expect(removeBookedSlots(slots, [at("10:00")], 90)).toEqual([at("13:00")]);
  });
});
