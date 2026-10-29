import { eq, like, or } from "drizzle-orm";
import type { Db } from "./connection";
import type { ailments, therapies } from "./schema";

/**
 * The first unused slug for a new row: `base`, else `base-2`, `base-3`, …
 * Call it inside the transaction that inserts the row.
 *
 * @param db - Database (or transaction) to check.
 * @param table - The table whose `slug` column must stay unique.
 * @param base - The slug made from the row's name.
 */
export function pickFreeSlug(
  db: Pick<Db, "select">,
  table: typeof ailments | typeof therapies,
  base: string,
): string {
  const taken = new Set(
    db
      .select({ slug: table.slug })
      .from(table)
      .where(or(eq(table.slug, base), like(table.slug, `${base}-%`)))
      .all()
      .map(({ slug }) => slug),
  );
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}
