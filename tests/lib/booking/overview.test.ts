import { describe, expect, it } from "vitest";
import { splitSchedule, summarizeSchedule } from "@/lib/booking/overview";
import { appointmentAt, THERAPIES } from "../../helpers/fixtures";

// Wednesday 28 October 2026, 12:30 UTC.
const NOW = new Date("2026-10-28T12:30:00.000Z");

const EARLIER_TODAY = appointmentAt("2026-10-28T09:00:00.000Z");
const LATER_TODAY = appointmentAt("2026-10-28T14:00:00.000Z", THERAPIES[0]);
const YESTERDAY = appointmentAt("2026-10-27T09:00:00.000Z");
const NEXT_WEEK = appointmentAt("2026-11-02T09:00:00.000Z");
const NEXT_WEEK_TOO = appointmentAt("2026-11-03T09:00:00.000Z");
const ALL = [YESTERDAY, EARLIER_TODAY, LATER_TODAY, NEXT_WEEK, NEXT_WEEK_TOO];

describe("splitSchedule", () => {
  it("puts upcoming bookings in time order and past ones latest first", () => {
    expect(splitSchedule(ALL, NOW)).toEqual({
      upcoming: [LATER_TODAY, NEXT_WEEK, NEXT_WEEK_TOO],
      past: [EARLIER_TODAY, YESTERDAY],
    });
  });
});

describe("summarizeSchedule", () => {
  it("counts today's and upcoming bookings and finds the busiest therapy", () => {
    expect(summarizeSchedule(splitSchedule(ALL, NOW), NOW, "UTC")).toEqual({
      today: 2,
      upcoming: 3,
      busiestTherapy: { name: "Grounding Session", count: 2 },
    });
  });

  it("decides what's today in the clinic's time zone", () => {
    // In Kiritimati (UTC+14) it's already 02:30 on the 29th, so only the
    // 14:00 UTC booking (04:00 on the 29th there) is today.
    const overview = summarizeSchedule(
      splitSchedule(ALL, NOW),
      NOW,
      "Pacific/Kiritimati",
    );

    expect(overview.today).toBe(1);
  });

  it("has no busiest therapy when nothing is upcoming", () => {
    expect(
      summarizeSchedule(splitSchedule([YESTERDAY], NOW), NOW, "UTC"),
    ).toEqual({ today: 0, upcoming: 0, busiestTherapy: null });
  });
});
