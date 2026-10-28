// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { getAilmentBySlug, listAilments } from "@/lib/db/ailments";
import type { Db } from "@/lib/db/connection";
import { ailments } from "@/lib/db/schema";
import { SEED_AILMENTS } from "@/lib/db/seed/data";
import { createTestDb } from "../../helpers/db";

describe("ailment queries", () => {
  let db: Db;

  beforeEach(() => {
    db = createTestDb();
  });

  it("lists every seeded ailment, ordered by name", () => {
    const names = listAilments(db).map((ailment) => ailment.name);

    expect(names).toEqual(SEED_AILMENTS.map((a) => a.name).toSorted());
  });

  it("finds an ailment by slug, with its therapies ordered by name", () => {
    const ailment = getAilmentBySlug(db, "hallucination-anxiety");

    expect(ailment?.name).toBe("Hallucination Anxiety");
    expect(ailment?.therapies.map((t) => t.slug)).toEqual([
      "citation-mindfulness",
      "grounding-session",
    ]);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getAilmentBySlug(db, "does-not-exist")).toBeUndefined();
  });

  it("returns an empty therapy list for an ailment with none", () => {
    db.insert(ailments)
      .values({
        slug: "untreated",
        name: "Untreated",
        summary: "No known cure.",
        description: "Nothing treats this yet.",
      })
      .run();

    expect(getAilmentBySlug(db, "untreated")?.therapies).toEqual([]);
  });
});
