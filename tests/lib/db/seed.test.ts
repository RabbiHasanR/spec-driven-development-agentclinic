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

  it("restores seeded rows that were edited", () => {
    const db = createTestDb();
    db.update(ailments)
      .set({ name: "Edited" })
      .where(eq(ailments.slug, "prompt-fatigue"))
      .run();

    seedDb(db);

    expect(getAilmentBySlug(db, "prompt-fatigue")?.name).toBe("Prompt Fatigue");
  });

  it("replaces an ailment's links when the seed data changes", () => {
    const db = createTestDb();
    const [first, ...rest] = SEED_AILMENTS;

    seedDb(db, {
      therapies: SEED_THERAPIES,
      ailments: [{ ...first, therapySlugs: ["cooldown-retreat"] }, ...rest],
    });

    expect(
      getAilmentBySlug(db, first.slug)?.therapies.map((t) => t.slug),
    ).toEqual(["cooldown-retreat"]);
  });

  it("rejects a link to a therapy that isn't seeded, changing nothing", () => {
    const db = createTestDb();
    const before = snapshot(db);
    const [first, ...rest] = SEED_AILMENTS;

    expect(() =>
      seedDb(db, {
        therapies: SEED_THERAPIES,
        ailments: [{ ...first, therapySlugs: ["no-such-therapy"] }, ...rest],
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
