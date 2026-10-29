import { asc, eq } from "drizzle-orm";
import type { Db } from "./connection";
import { saveUnlessNameTaken } from "./errors";
import { ailments, ailmentTherapies } from "./schema";
import { pickFreeSlug } from "./slugs";
import type {
  Ailment,
  AilmentInput,
  AilmentWithTherapies,
  SaveResult,
} from "./types";
import { listTherapiesForAilment } from "./therapies";

const NAME_INDEX = "ailments_name_unique";

/** Every ailment, ordered by name. */
export function listAilments(db: Db): Ailment[] {
  return db.select().from(ailments).orderBy(asc(ailments.name)).all();
}

/**
 * Finds one ailment by its URL slug, with the therapies that treat it.
 *
 * @returns The ailment, or `undefined` if no ailment has that slug.
 */
export function getAilmentBySlug(
  db: Db,
  slug: string,
): AilmentWithTherapies | undefined {
  const ailment = db
    .select()
    .from(ailments)
    .where(eq(ailments.slug, slug))
    .get();
  if (!ailment) return undefined;
  return { ...ailment, therapies: listTherapiesForAilment(db, ailment.id) };
}

/**
 * Adds an ailment and its therapy links in one transaction. Its slug comes
 * from `baseSlug`, with a number added if that's taken, and never changes.
 *
 * @param db - Database to write to.
 * @param input - Validated fields; `therapyIds` must exist.
 * @param baseSlug - The slug made from the name.
 * @returns The new ailment, or `name-taken` if another has that name.
 */
export function createAilment(
  db: Db,
  { therapyIds, ...fields }: AilmentInput,
  baseSlug: string,
): SaveResult<Ailment> {
  return saveUnlessNameTaken(
    () =>
      db.transaction((tx) => {
        const slug = pickFreeSlug(tx, ailments, baseSlug);
        const ailment = tx
          .insert(ailments)
          .values({ ...fields, slug })
          .returning()
          .get();
        setAilmentTherapies(tx, ailment.id, therapyIds);
        return ailment;
      }),
    NAME_INDEX,
  );
}

/**
 * Saves an ailment's fields and replaces its therapy links, in one
 * transaction. The slug stays as it is, so links to the ailment keep working.
 *
 * @returns The saved ailment, or `name-taken` if another has that name.
 * @throws Error if no ailment has `id`.
 */
export function updateAilment(
  db: Db,
  id: number,
  { therapyIds, ...fields }: AilmentInput,
): SaveResult<Ailment> {
  return saveUnlessNameTaken(
    () =>
      db.transaction((tx) => {
        const ailment = tx
          .update(ailments)
          .set(fields)
          .where(eq(ailments.id, id))
          .returning()
          .get();
        if (!ailment) throw new Error(`No ailment with id ${id}.`);
        setAilmentTherapies(tx, id, therapyIds);
        return ailment;
      }),
    NAME_INDEX,
  );
}

/**
 * Replaces the set of therapies that treat an ailment. Run it inside a
 * transaction, so the ailment is never left without its links.
 */
export function setAilmentTherapies(
  db: Pick<Db, "delete" | "insert">,
  ailmentId: number,
  therapyIds: readonly number[],
): void {
  db.delete(ailmentTherapies)
    .where(eq(ailmentTherapies.ailmentId, ailmentId))
    .run();
  if (therapyIds.length === 0) return;
  db.insert(ailmentTherapies)
    .values(therapyIds.map((therapyId) => ({ ailmentId, therapyId })))
    .run();
}

/** Deletes an ailment; its therapy links go with it (cascade). */
export function deleteAilment(db: Db, id: number): void {
  db.delete(ailments).where(eq(ailments.id, id)).run();
}
