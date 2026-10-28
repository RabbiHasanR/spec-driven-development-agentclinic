// @vitest-environment node
import { describe, expect, it } from "vitest";
import type { Db } from "@/lib/db/connection";
import { ailments, ailmentTherapies, therapies } from "@/lib/db/schema";
import { seedDb } from "@/lib/db/seed";
import { SEED_AILMENTS, SEED_THERAPIES } from "@/lib/db/seed/data";
import { createTestDb } from "../../helpers/db";

const rowCounts = async (db: Db) => ({
  ailments: await db.$count(ailments),
  therapies: await db.$count(therapies),
  links: await db.$count(ailmentTherapies),
});

describe("seedDb", () => {
  it("loads every seeded ailment, therapy, and link", async () => {
    expect(await rowCounts(createTestDb())).toEqual({
      ailments: SEED_AILMENTS.length,
      therapies: SEED_THERAPIES.length,
      links: SEED_AILMENTS.flatMap((a) => a.therapySlugs).length,
    });
  });

  it("is idempotent: seeding twice leaves the row counts unchanged", async () => {
    const db = createTestDb();
    const before = await rowCounts(db);

    seedDb(db);

    expect(await rowCounts(db)).toEqual(before);
  });

  it("gives every seeded ailment at least one therapy", () => {
    for (const ailment of SEED_AILMENTS) {
      expect(ailment.therapySlugs.length, ailment.slug).toBeGreaterThan(0);
    }
  });
});
