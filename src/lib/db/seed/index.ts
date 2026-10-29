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
 * Adds any missing catalog seed data, keyed on slug. Safe to run repeatedly,
 * including on a live database.
 *
 * Rows that already exist are left exactly as they are, links included, so
 * reseeding never overwrites what staff have edited. Rows removed from the
 * seed data are left in place too, so reseeding never cascades into bookings.
 *
 * @param db - Database to seed; must already be migrated.
 * @param data - Catalog to load; defaults to the app's seed data.
 * @throws Error if a new ailment links to a therapy slug that doesn't exist.
 */
export function seedDb(db: Db, data: SeedData = DEFAULT_SEED): void {
  db.transaction((tx) => {
    for (const therapy of data.therapies) {
      tx.insert(therapies).values(therapy).onConflictDoNothing().run();
    }
    const therapyIds = new Map(
      tx
        .select({ slug: therapies.slug, id: therapies.id })
        .from(therapies)
        .all()
        .map(({ slug, id }) => [slug, id]),
    );

    for (const { therapySlugs, ...ailment } of data.ailments) {
      const inserted = tx
        .insert(ailments)
        .values(ailment)
        .onConflictDoNothing()
        .returning({ id: ailments.id })
        .get();
      // Already there: keep its current fields and links.
      if (!inserted) continue;

      for (const slug of therapySlugs) {
        const therapyId = therapyIds.get(slug);
        if (therapyId === undefined) {
          throw new Error(
            `Ailment "${ailment.slug}" links unknown therapy "${slug}".`,
          );
        }
        tx.insert(ailmentTherapies)
          .values({ ailmentId: inserted.id, therapyId })
          .run();
      }
    }
  });
}
