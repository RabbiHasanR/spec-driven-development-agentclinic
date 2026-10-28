import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export type Db = BetterSQLite3Database<typeof schema>;

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
 * @returns A Drizzle client with the app schema and foreign keys enforced.
 */
export function createDb(path: string): Db {
  if (path !== IN_MEMORY) mkdirSync(dirname(path), { recursive: true });
  const sqlite = new Database(path);
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}
