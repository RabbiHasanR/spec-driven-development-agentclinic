import { resolve } from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { Db } from "./connection";

/** Generated SQL migrations (see `drizzle.config.ts`), resolved from the repo root. */
export const MIGRATIONS_DIR = resolve("drizzle");

/**
 * Applies all pending migrations to `db`.
 *
 * Foreign keys are switched off while migrating. Drizzle runs migrations in
 * one transaction, where SQLite ignores the `PRAGMA foreign_keys=OFF` that
 * drizzle-kit emits for table rebuilds, so a rebuild's `DROP TABLE` would
 * otherwise cascade-delete every row referencing that table.
 *
 * @param db - Database to migrate.
 * @param migrationsFolder - Folder of generated migrations.
 * @throws Error if the migrated data violates a foreign key.
 */
export function migrateDb(db: Db, migrationsFolder = MIGRATIONS_DIR): void {
  const sqlite = db.$client;
  sqlite.pragma("foreign_keys = OFF");
  try {
    migrate(db, { migrationsFolder });
    const violations = sqlite.pragma("foreign_key_check") as unknown[];
    if (violations.length > 0) {
      throw new Error(
        `Migration left ${violations.length} foreign key violation(s).`,
      );
    }
  } finally {
    sqlite.pragma("foreign_keys = ON");
  }
}
