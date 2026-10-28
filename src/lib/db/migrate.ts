import { resolve } from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { Db } from "./connection";

/** Generated SQL migrations (see `drizzle.config.ts`), resolved from the repo root. */
export const MIGRATIONS_DIR = resolve("drizzle");

/** Applies all pending migrations to `db`. */
export function migrateDb(db: Db): void {
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
}
