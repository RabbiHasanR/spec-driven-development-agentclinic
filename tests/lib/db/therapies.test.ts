// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getAilmentBySlug } from "@/lib/db/ailments";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { createTestDb } from "../../helpers/db";

describe("therapy queries", () => {
  it("shows a therapy shared by two ailments on both", () => {
    const db = createTestDb();
    const slugsFor = (ailmentSlug: string) =>
      getAilmentBySlug(db, ailmentSlug)?.therapies.map((t) => t.slug);

    expect(slugsFor("context-window-overflow")).toContain(
      "context-decompression",
    );
    expect(slugsFor("prompt-fatigue")).toContain("context-decompression");
  });

  it("finds a therapy by slug, and nothing for an unknown slug", () => {
    const db = createTestDb();
    expect(getTherapyBySlug(db, "grounding-session")?.name).toBe(
      "Grounding Session",
    );
    expect(getTherapyBySlug(db, "does-not-exist")).toBeUndefined();
  });
});
