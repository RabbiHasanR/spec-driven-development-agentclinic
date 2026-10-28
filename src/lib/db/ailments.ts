import { asc, eq } from "drizzle-orm";
import type { Db } from "./connection";
import { ailments } from "./schema";
import type { Ailment, AilmentWithTherapies } from "./types";
import { listTherapiesForAilment } from "./therapies";

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
