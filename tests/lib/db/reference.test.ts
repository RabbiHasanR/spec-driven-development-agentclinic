// @vitest-environment node
import { describe, expect, it } from "vitest";
import { generateReference } from "@/lib/db/reference";

describe("generateReference", () => {
  it("makes AC- codes from unambiguous characters", () => {
    expect(generateReference()).toMatch(/^AC-[2-9A-HJ-NP-Z]{6}$/);
  });

  it("makes a different code each time", () => {
    const codes = new Set(Array.from({ length: 50 }, generateReference));

    expect(codes.size).toBe(50);
  });
});
