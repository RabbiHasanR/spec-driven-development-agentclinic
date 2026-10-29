import { describe, expect, it } from "vitest";
import {
  allowedChanges,
  parseStatusChange,
  whyChangeNotAllowed,
} from "@/lib/booking/status";

const STARTS_AT = "2026-11-02T09:00:00.000Z";
const BEFORE = new Date("2026-11-02T08:59:59.000Z");
const AT_START = new Date(STARTS_AT);
const AFTER = new Date("2026-11-02T10:00:00.000Z");

const booking = (status: "booked" | "attended" | "no_show" | "cancelled") => ({
  status,
  startsAt: STARTS_AT,
});

describe("allowedChanges", () => {
  it("allows only cancelling before the slot starts", () => {
    expect(allowedChanges(booking("booked"), BEFORE)).toEqual(["cancelled"]);
  });

  it.each([AT_START, AFTER])(
    "allows marking attended or no-show once started (%s)",
    (now) => {
      expect(allowedChanges(booking("booked"), now)).toEqual([
        "attended",
        "no_show",
      ]);
    },
  );

  it.each(["attended", "no_show", "cancelled"] as const)(
    "allows nothing from the final status %s",
    (status) => {
      expect(allowedChanges(booking(status), BEFORE)).toEqual([]);
      expect(allowedChanges(booking(status), AFTER)).toEqual([]);
    },
  );
});

describe("parseStatusChange", () => {
  it.each(["attended", "no_show", "cancelled"])("accepts %s", (value) => {
    expect(parseStatusChange(value)).toBe(value);
  });

  it.each(["booked", "bogus", "toString", "", null, 1])(
    "rejects %s",
    (value) => {
      expect(parseStatusChange(value)).toBeUndefined();
    },
  );
});

describe("whyChangeNotAllowed", () => {
  it("explains a cancel after the slot started, and what to do instead", () => {
    expect(whyChangeNotAllowed(booking("booked"), "cancelled", AFTER)).toBe(
      "This appointment has started, so it can’t be cancelled. Mark it attended or a no-show instead.",
    );
  });

  it("explains marking attendance before the slot starts", () => {
    expect(whyChangeNotAllowed(booking("booked"), "no_show", BEFORE)).toBe(
      "This appointment hasn’t started yet, so it can’t be marked a no-show.",
    );
  });

  it.each([
    ["cancelled", "This booking was cancelled, so it can’t change any more."],
    [
      "no_show",
      "This booking was marked a no-show, so it can’t change any more.",
    ],
    [
      "attended",
      "This booking was marked attended, so it can’t change any more.",
    ],
  ] as const)("explains a final %s booking", (status, message) => {
    expect(whyChangeNotAllowed(booking(status), "cancelled", BEFORE)).toBe(
      message,
    );
  });
});
