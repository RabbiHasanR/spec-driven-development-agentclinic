import { describe, expect, it } from "vitest";
import {
  formatSlot,
  formatSlotDay,
  formatSlotTime,
  groupSlotsByDay,
} from "@/lib/booking/format";

describe("slot formatting", () => {
  it("formats a slot's day, time, and both together in clinic time", () => {
    const slot = "2026-11-02T09:00:00.000Z";

    expect(formatSlotDay(slot)).toBe("Monday 2 November");
    expect(formatSlotTime(slot)).toBe("09:00");
    expect(formatSlot(slot)).toBe("Monday 2 November, 09:00 UTC");
  });

  it("groups slots by day, keeping their order", () => {
    expect(
      groupSlotsByDay([
        "2026-11-02T09:00:00.000Z",
        "2026-11-02T10:00:00.000Z",
        "2026-11-03T09:00:00.000Z",
      ]),
    ).toEqual([
      {
        day: "Monday 2 November",
        slots: [
          { value: "2026-11-02T09:00:00.000Z", label: "09:00" },
          { value: "2026-11-02T10:00:00.000Z", label: "10:00" },
        ],
      },
      {
        day: "Tuesday 3 November",
        slots: [{ value: "2026-11-03T09:00:00.000Z", label: "09:00" }],
      },
    ]);
  });

  it("groups nothing into no days", () => {
    expect(groupSlotsByDay([])).toEqual([]);
  });
});
