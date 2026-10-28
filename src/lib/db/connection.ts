import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/** Drizzle client plus `$client`, the underlying better-sqlite3 connection. */
export type Db = BetterSQLite3Database<typeof schema> & {
  $client: Database.Database;
};

/** SQLite path for an in-memory database (used by tests). */
export const IN_MEMORY = ":memory:";

/**
 * Reads the database file path from the `DATABASE_URL` env var.
 *
 * @returns The configured SQLite file path.
 * @throws Error if `DATABASE_URL` is unset.
 */
export function getDatabasePath(): string {
  const path = process.env.DATABASE_URL;
  if (!path) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env (see README).",
    );
  }
  return path;
}

/**
 * Opens a SQLite database and wraps it in a Drizzle client.
 *
 * @param path - SQLite file path, or {@link IN_MEMORY}.
 * @param options.create - Create the file (and its directory) if missing.
 *   Only `db:migrate` should pass this, so a mistyped `DATABASE_URL` fails
 *   loudly instead of silently creating an empty database.
 * @returns A Drizzle client with the app schema and foreign keys enforced.
 * @throws Error if the file doesn't exist and `create` is false.
 */
export function createDb(
  path: string,
  { create = false }: { create?: boolean } = {},
): Db {
  if (path !== IN_MEMORY) {
    if (create) {
      mkdirSync(dirname(path), { recursive: true });
    } else if (!existsSync(path)) {
      throw new Error(
        `No database at "${path}". Run \`npm run db:migrate\` first (see README).`,
      );
    }
  }
  const sqlite = new Database(path);
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}
