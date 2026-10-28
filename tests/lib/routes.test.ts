import { describe, expect, it } from "vitest";
import { ailmentPath, isActivePath, ROUTES } from "@/lib/routes";

describe("routes", () => {
  it("builds an ailment's detail path", () => {
    expect(ailmentPath("prompt-fatigue")).toBe("/ailments/prompt-fatigue");
  });

  it.each([
    ["/ailments", ROUTES.ailments, true],
    ["/ailments/prompt-fatigue", ROUTES.ailments, true],
    ["/ailments-archive", ROUTES.ailments, false],
    ["/", ROUTES.ailments, false],
    ["/", ROUTES.home, true],
    ["/ailments", ROUTES.home, false],
  ])("isActivePath(%s, %s) is %s", (pathname, href, expected) => {
    expect(isActivePath(pathname, href)).toBe(expected);
  });
});
