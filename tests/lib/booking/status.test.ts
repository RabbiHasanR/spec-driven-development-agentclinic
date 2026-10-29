import { describe, expect, it } from "vitest";
import { allowedTransitions, parseStatusChange } from "@/lib/booking/status";

const STARTS_AT = "2026-11-02T09:00:00.000Z";
const BEFORE = new Date("2026-11-02T08:59:59.000Z");
const AT_START = new Date(STARTS_AT);
const AFTER = new Date("2026-11-02T10:00:00.000Z");

const booking = (status: "booked" | "attended" | "no_show" | "cancelled") => ({
  status,
  startsAt: STARTS_AT,
});

describe("allowedTransitions", () => {
  it("allows only cancelling before the slot starts", () => {
    expect(allowedTransitions(booking("booked"), BEFORE)).toEqual([
      "cancelled",
    ]);
  });

  it.each([AT_START, AFTER])(
    "allows marking attended or no-show once started (%s)",
    (now) => {
      expect(allowedTransitions(booking("booked"), now)).toEqual([
        "attended",
        "no_show",
      ]);
    },
  );

  it.each(["attended", "no_show", "cancelled"] as const)(
    "allows nothing from the final status %s",
    (status) => {
      expect(allowedTransitions(booking(status), BEFORE)).toEqual([]);
      expect(allowedTransitions(booking(status), AFTER)).toEqual([]);
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
