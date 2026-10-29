import { createDb, IN_MEMORY, type Db } from "@/lib/db/connection";
import { migrateDb } from "@/lib/db/migrate";
import { seedDb } from "@/lib/db/seed";

/**
 * Builds a fresh in-memory database with real migrations applied.
 *
 * @param options.seed - Load the catalog seed data (default `true`).
 */
export function createTestDb({ seed = true }: { seed?: boolean } = {}): Db {
  const db = createDb(IN_MEMORY);
  migrateDb(db);
  if (seed) seedDb(db);
  return db;
}

/** The database `getDb()` returns in tests that mock it with {@link client}. */
export const testDb: { current?: Db } = {};

/** Stand-in for `@/lib/db/client`. Mock with:
 *  vi.mock("@/lib/db/client", () => import("@tests/helpers/db").then((m) => m.client));
 */
export const client = {
  getDb: (): Db => {
    if (!testDb.current) throw new Error("Set testDb.current first.");
    return testDb.current;
  },
};
