import { asc, eq, getTableColumns } from "drizzle-orm";
import type { Db } from "./connection";
import { ailmentTherapies, therapies, type Therapy } from "./schema";

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
