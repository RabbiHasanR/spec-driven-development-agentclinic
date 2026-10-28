import { describe, expect, it } from "vitest";
import {
  ailmentPath,
  bookingPath,
  bookTherapyPath,
  isActivePath,
  ROUTES,
} from "@/lib/routes";

describe("routes", () => {
  it("builds an ailment's detail path", () => {
    expect(ailmentPath("prompt-fatigue")).toBe("/ailments/prompt-fatigue");
  });

  it("builds a therapy's booking path", () => {
    expect(bookTherapyPath("grounding-session")).toBe(
      "/therapies/grounding-session/book",
    );
  });

  it("builds a booking's confirmation path", () => {
    expect(bookingPath("AC-7F3K9Q")).toBe("/bookings/AC-7F3K9Q");
  });

  it.each([
    ["/ailments", ROUTES.ailments, true],
    ["/ailments/prompt-fatigue", ROUTES.ailments, true],
    ["/ailments-archive", ROUTES.ailments, false],
    ["/", ROUTES.ailments, false],
    ["/", ROUTES.home, true],
    ["/ailments", ROUTES.home, false],
    ["/dashboard", ROUTES.dashboard, true],
  ])("isActivePath(%s, %s) is %s", (pathname, href, expected) => {
    expect(isActivePath(pathname, href)).toBe(expected);
  });
});
