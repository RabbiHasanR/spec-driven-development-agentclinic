import type { Db } from "../connection";
import { ailments, ailmentTherapies, therapies } from "../schema";
import { SEED_AILMENTS, SEED_THERAPIES } from "./data";

/**
 * Upserts the catalog seed data, keyed on slug. Safe to run repeatedly.
 *
 * @param db - Database to seed; must already be migrated.
 * @throws Error if an ailment links to a therapy slug that isn't seeded.
 */
export function seedDb(db: Db): void {
  db.transaction((tx) => {
    const therapyIds = new Map<string, number>();
    for (const therapy of SEED_THERAPIES) {
      const { id } = tx
        .insert(therapies)
        .values(therapy)
        .onConflictDoUpdate({ target: therapies.slug, set: therapy })
        .returning({ id: therapies.id })
        .get();
      therapyIds.set(therapy.slug, id);
    }

    for (const { therapySlugs, ...ailment } of SEED_AILMENTS) {
      const { id: ailmentId } = tx
        .insert(ailments)
        .values(ailment)
        .onConflictDoUpdate({ target: ailments.slug, set: ailment })
        .returning({ id: ailments.id })
        .get();

      for (const slug of therapySlugs) {
        const therapyId = therapyIds.get(slug);
        if (therapyId === undefined) {
          throw new Error(
            `Ailment "${ailment.slug}" links unknown therapy "${slug}".`,
          );
        }
        tx.insert(ailmentTherapies)
          .values({ ailmentId, therapyId })
          .onConflictDoNothing()
          .run();
      }
    }
  });
}
