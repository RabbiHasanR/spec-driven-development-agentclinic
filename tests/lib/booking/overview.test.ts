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

  it("has no single busiest therapy when the top counts tie", () => {
    const tied = [LATER_TODAY, NEXT_WEEK]; // one each for two therapies

    expect(
      summarizeSchedule(splitSchedule(tied, NOW), NOW, "UTC").busiestTherapy,
    ).toBeNull();
  });

  it("counts therapies by id, not name", () => {
    const twin = { ...THERAPIES[0], id: 99 }; // same name, different therapy
    const appointments = [
      appointmentAt("2026-11-02T09:00:00.000Z", THERAPIES[0]),
      appointmentAt("2026-11-02T10:00:00.000Z", twin),
      appointmentAt("2026-11-02T11:00:00.000Z", THERAPIES[1]),
      appointmentAt("2026-11-02T12:00:00.000Z", THERAPIES[1]),
    ];

    expect(
      summarizeSchedule(splitSchedule(appointments, NOW), NOW, "UTC")
        .busiestTherapy,
    ).toEqual({ name: THERAPIES[1].name, count: 2 });
  });

  it("has no busiest therapy when nothing is upcoming", () => {
    expect(
      summarizeSchedule(splitSchedule([YESTERDAY], NOW), NOW, "UTC"),
    ).toEqual({ today: 0, upcoming: 0, busiestTherapy: null });
  });

  it("leaves cancelled and no-show bookings out of the numbers", () => {
    const cancelled = { ...LATER_TODAY, status: "cancelled" as const };
    const noShow = { ...EARLIER_TODAY, status: "no_show" as const };
    const attended = { ...YESTERDAY, status: "attended" as const };
    const schedule = splitSchedule(
      [attended, noShow, cancelled, NEXT_WEEK],
      NOW,
    );

    expect(summarizeSchedule(schedule, NOW, "UTC")).toEqual({
      today: 0,
      upcoming: 1,
      busiestTherapy: { name: "Grounding Session", count: 1 },
    });
  });
});
