import { sql } from "drizzle-orm";
import type { Db } from "./connection";

/**
 * Runs a trivial query, to check the database answers.
 *
 * @throws The driver's error when it doesn't.
 */
export function pingDb(db: Db): void {
  db.get(sql`select 1`);
}
