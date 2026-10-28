// @vitest-environment node
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAilmentBySlug } from "@/lib/db/ailments";
import { createDb, IN_MEMORY } from "@/lib/db/connection";
import { MIGRATIONS_DIR, migrateDb } from "@/lib/db/migrate";
import { seedDb } from "@/lib/db/seed";

// The shape drizzle-kit generates when SQLite can't ALTER a table in place.
const REBUILD_THERAPIES_SQL = [
  "PRAGMA foreign_keys=OFF;",
  "CREATE TABLE `__new_therapies` (`id` integer PRIMARY KEY NOT NULL, `slug` text NOT NULL, `name` text NOT NULL, `summary` text NOT NULL, `duration_minutes` integer NOT NULL);",
  "INSERT INTO `__new_therapies` SELECT `id`, `slug`, `name`, `summary`, `duration_minutes` FROM `therapies`;",
  "DROP TABLE `therapies`;",
  "ALTER TABLE `__new_therapies` RENAME TO `therapies`;",
  "PRAGMA foreign_keys=ON;",
  "CREATE UNIQUE INDEX `therapies_slug_unique` ON `therapies` (`slug`);",
].join("\n--> statement-breakpoint\n");

/** Copies the real migrations and appends a table-rebuild migration. */
function migrationsWithRebuild(dir: string): string {
  cpSync(MIGRATIONS_DIR, dir, { recursive: true });
  const journalPath = join(dir, "meta", "_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf8"));
  const last = journal.entries.at(-1);
  const tag = "9999_rebuild_therapies";
  journal.entries.push({
    ...last,
    idx: last.idx + 1,
    when: last.when + 1,
    tag,
  });
  writeFileSync(journalPath, JSON.stringify(journal));
  writeFileSync(join(dir, `${tag}.sql`), REBUILD_THERAPIES_SQL);
  return dir;
}

describe("migrateDb", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "agentclinic-migrations-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("keeps linked rows when a later migration rebuilds a table", () => {
    const db = createDb(IN_MEMORY);
    migrateDb(db);
    seedDb(db);

    migrateDb(db, migrationsWithRebuild(dir));

    expect(
      getAilmentBySlug(db, "prompt-fatigue")?.therapies.length,
    ).toBeGreaterThan(0);
  });

  it("re-enables foreign keys afterwards", () => {
    const db = createDb(IN_MEMORY);
    migrateDb(db);

    expect(db.$client.pragma("foreign_keys", { simple: true })).toBe(1);
  });
});
