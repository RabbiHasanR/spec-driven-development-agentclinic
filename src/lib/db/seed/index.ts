import { eq } from "drizzle-orm";
import type { Db } from "../connection";
import { ailments, ailmentTherapies, therapies } from "../schema";
import {
  SEED_AILMENTS,
  SEED_THERAPIES,
  type SeedAilment,
  type SeedTherapy,
} from "./data";

export type SeedData = { ailments: SeedAilment[]; therapies: SeedTherapy[] };

const DEFAULT_SEED: SeedData = {
  ailments: SEED_AILMENTS,
  therapies: SEED_THERAPIES,
};

/**
 * Upserts the catalog seed data, keyed on slug. Safe to run repeatedly.
 *
 * Seeded rows are updated to match the data, and each seeded ailment's
 * therapy links are replaced. Rows removed from the seed data are left in
 * place rather than deleted, so reseeding never cascades into other data.
 *
 * @param db - Database to seed; must already be migrated.
 * @param data - Catalog to load; defaults to the app's seed data.
 * @throws Error if an ailment links to a therapy slug that isn't seeded.
 */
export function seedDb(db: Db, data: SeedData = DEFAULT_SEED): void {
  db.transaction((tx) => {
    const therapyIds = new Map<string, number>();
    for (const therapy of data.therapies) {
      const { id } = tx
        .insert(therapies)
        .values(therapy)
        .onConflictDoUpdate({ target: therapies.slug, set: therapy })
        .returning({ id: therapies.id })
        .get();
      therapyIds.set(therapy.slug, id);
    }

    for (const { therapySlugs, ...ailment } of data.ailments) {
      const { id: ailmentId } = tx
        .insert(ailments)
        .values(ailment)
        .onConflictDoUpdate({ target: ailments.slug, set: ailment })
        .returning({ id: ailments.id })
        .get();

      tx.delete(ailmentTherapies)
        .where(eq(ailmentTherapies.ailmentId, ailmentId))
        .run();
      for (const slug of therapySlugs) {
        const therapyId = therapyIds.get(slug);
        if (therapyId === undefined) {
          throw new Error(
            `Ailment "${ailment.slug}" links unknown therapy "${slug}".`,
          );
        }
        tx.insert(ailmentTherapies).values({ ailmentId, therapyId }).run();
      }
    }
  });
}
