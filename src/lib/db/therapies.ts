import { asc, eq, getTableColumns, sql } from "drizzle-orm";
import type { Db } from "./connection";
import { isForeignKeyViolation, saveUnlessNameTaken } from "./errors";
import { ailments, ailmentTherapies, therapies } from "./schema";
import { pickFreeSlug } from "./slugs";
import type { SaveResult, Therapy, TherapyFields } from "./types";

const NAME_INDEX = "therapies_name_unique";

export type DeleteTherapyResult =
  | { ok: true }
  | { ok: false; reason: "has-bookings" }
  /** Deleting it would leave these ailments with no therapy to book. */
  | { ok: false; reason: "sole-therapy"; ailments: string[] };

/** Every therapy, ordered by name. */
export function listTherapies(db: Db): Therapy[] {
  return db.select().from(therapies).orderBy(asc(therapies.name)).all();
}

/** Therapies that treat the given ailment, ordered by name. */
export function listTherapiesForAilment(db: Db, ailmentId: number): Therapy[] {
  return db
    .select(getTableColumns(therapies))
    .from(therapies)
    .innerJoin(ailmentTherapies, eq(ailmentTherapies.therapyId, therapies.id))
    .where(eq(ailmentTherapies.ailmentId, ailmentId))
    .orderBy(asc(therapies.name))
    .all();
}

/**
 * Finds one therapy by its URL slug.
 *
 * @returns The therapy, or `undefined` if no therapy has that slug.
 */
export function getTherapyBySlug(db: Db, slug: string): Therapy | undefined {
  return db.select().from(therapies).where(eq(therapies.slug, slug)).get();
}

/**
 * Adds a therapy. Its slug comes from `baseSlug`, with a number added if
 * that's taken, and never changes.
 *
 * @returns The new therapy, or `name-taken` if another has that name.
 */
export function createTherapy(
  db: Db,
  fields: TherapyFields,
  baseSlug: string,
): SaveResult<Therapy> {
  return saveUnlessNameTaken(
    () =>
      db.transaction((tx) => {
        const slug = pickFreeSlug(tx, therapies, baseSlug);
        return tx
          .insert(therapies)
          .values({ ...fields, slug })
          .returning()
          .get();
      }),
    NAME_INDEX,
  );
}

/**
 * Saves a therapy's fields; its slug stays as it is. Existing bookings keep
 * their times even if the duration changes; new slots avoid overlapping them.
 *
 * @returns The saved therapy, or `name-taken` if another has that name.
 * @throws Error if no therapy has `id`.
 */
export function updateTherapy(
  db: Db,
  id: number,
  fields: TherapyFields,
): SaveResult<Therapy> {
  return saveUnlessNameTaken(() => {
    const therapy = db
      .update(therapies)
      .set(fields)
      .where(eq(therapies.id, id))
      .returning()
      .get();
    if (!therapy) throw new Error(`No therapy with id ${id}.`);
    return therapy;
  }, NAME_INDEX);
}

/**
 * Deletes a therapy, unless that would lose bookings or strand an ailment.
 *
 * - Any booking (any status) blocks it: the `restrict` foreign key refuses.
 * - So does being the only therapy linked to an ailment, which would leave
 *   agents with that ailment nothing to book.
 */
export function deleteTherapy(db: Db, id: number): DeleteTherapyResult {
  return db.transaction((tx) => {
    const stranded = tx
      .select({
        name: ailments.name,
        links: sql<number>`(select count(*) from ${ailmentTherapies} as l where l.ailment_id = ${ailmentTherapies.ailmentId})`,
      })
      .from(ailmentTherapies)
      .innerJoin(ailments, eq(ailments.id, ailmentTherapies.ailmentId))
      .where(eq(ailmentTherapies.therapyId, id))
      .orderBy(asc(ailments.name))
      .all()
      .filter(({ links }) => links === 1)
      .map(({ name }) => name);
    if (stranded.length > 0) {
      return { ok: false, reason: "sole-therapy", ailments: stranded };
    }

    try {
      tx.delete(therapies).where(eq(therapies.id, id)).run();
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return { ok: false, reason: "has-bookings" };
      }
      throw error;
    }
    return { ok: true };
  });
}
