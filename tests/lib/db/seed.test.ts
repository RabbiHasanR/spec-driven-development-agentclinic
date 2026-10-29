// @vitest-environment node
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getAilmentBySlug, listAilments } from "@/lib/db/ailments";
import type { Db } from "@/lib/db/connection";
import { ailments, ailmentTherapies, therapies } from "@/lib/db/schema";
import { seedDb } from "@/lib/db/seed";
import { SEED_AILMENTS, SEED_THERAPIES } from "@/lib/db/seed/data";
import { createTestDb } from "../../helpers/db";

/** Every catalog row, for before/after comparisons. */
const snapshot = (db: Db) => ({
  ailments: db.select().from(ailments).all(),
  therapies: db.select().from(therapies).all(),
  links: db.select().from(ailmentTherapies).all(),
});

describe("seedDb", () => {
  it("loads every seeded ailment, therapy, and link", () => {
    const { ailments, therapies, links } = snapshot(createTestDb());

    expect(ailments).toHaveLength(SEED_AILMENTS.length);
    expect(therapies).toHaveLength(SEED_THERAPIES.length);
    expect(links).toHaveLength(
      SEED_AILMENTS.flatMap((a) => a.therapySlugs).length,
    );
  });

  it("is idempotent: seeding twice leaves the same data", () => {
    const db = createTestDb();
    const before = snapshot(db);

    seedDb(db);

    expect(snapshot(db)).toEqual(before);
  });

  it("keeps staff edits to seeded rows and their links", () => {
    const db = createTestDb();
    db.update(ailments)
      .set({ name: "Edited" })
      .where(eq(ailments.slug, "prompt-fatigue"))
      .run();
    const ailmentId = getAilmentBySlug(db, "prompt-fatigue")!.id;
    db.delete(ailmentTherapies)
      .where(eq(ailmentTherapies.ailmentId, ailmentId))
      .run();
    const before = snapshot(db);

    seedDb(db);

    expect(snapshot(db)).toEqual(before);
    expect(getAilmentBySlug(db, "prompt-fatigue")?.name).toBe("Edited");
  });

  it("adds seed rows that are missing, with their links", () => {
    const db = createTestDb();
    const [first] = SEED_AILMENTS;
    db.delete(ailments).where(eq(ailments.slug, first.slug)).run();

    seedDb(db);

    expect(
      getAilmentBySlug(db, first.slug)
        ?.therapies.map((t) => t.slug)
        .sort(),
    ).toEqual([...first.therapySlugs].sort());
  });

  it("rejects a new ailment linking a therapy that doesn't exist, changing nothing", () => {
    const db = createTestDb();
    const before = snapshot(db);
    const [first] = SEED_AILMENTS;

    expect(() =>
      seedDb(db, {
        therapies: SEED_THERAPIES,
        ailments: [
          {
            ...first,
            slug: "brand-new",
            name: "Brand New",
            therapySlugs: ["no-such-therapy"],
          },
        ],
      }),
    ).toThrow(/no-such-therapy/);
    expect(snapshot(db)).toEqual(before);
  });

  it("gives every seeded ailment at least one therapy", () => {
    const db = createTestDb();

    for (const { slug } of listAilments(db)) {
      expect(
        getAilmentBySlug(db, slug)?.therapies.length,
        slug,
      ).toBeGreaterThan(0);
    }
  });
});
