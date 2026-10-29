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
import { getAppointmentByReference } from "@/lib/db/appointments";
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

/** Copies the real migrations, keeping only those up to and including `tag`. */
function migrationsUpTo(dir: string, tag: string): string {
  cpSync(MIGRATIONS_DIR, dir, { recursive: true });
  const journalPath = join(dir, "meta", "_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf8"));
  const end = journal.entries.findIndex((e: { tag: string }) => e.tag === tag);
  journal.entries = journal.entries.slice(0, end + 1);
  writeFileSync(journalPath, JSON.stringify(journal));
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

  it("upgrades a Phase 2 database, keeping its bookings as booked", () => {
    const db = createDb(IN_MEMORY);
    migrateDb(db, migrationsUpTo(dir, "0003_appointments"));
    seedDb(db);
    db.$client
      .prepare(
        "INSERT INTO appointments (reference, therapy_id, starts_at, agent_name, agent_email, created_at) SELECT 'AC-OLD001', id, '2026-11-02T09:00:00.000Z', 'Ada', 'ada@example.com', '2026-10-28T12:30:00.000Z' FROM therapies LIMIT 1",
      )
      .run();

    migrateDb(db);

    const upgraded = getAppointmentByReference(db, "AC-OLD001");
    expect(upgraded).toMatchObject({
      agentName: "Ada",
      status: "booked",
      statusChangedAt: null,
    });
    // Filled from its therapy's length at upgrade time.
    expect(upgraded?.durationMinutes).toBe(upgraded?.therapy.durationMinutes);
  });

  it("renames names that differ only in case, instead of failing the upgrade", () => {
    const db = createDb(IN_MEMORY);
    migrateDb(db, migrationsUpTo(dir, "0004_appointment_status"));
    const insert = db.$client.prepare(
      "INSERT INTO ailments (slug, name, summary, description) VALUES (?, ?, 's', 'd')",
    );
    insert.run("foo", "Foo");
    insert.run("foo-2", "foo");

    migrateDb(db);

    const names = db.$client
      .prepare("SELECT id, name FROM ailments ORDER BY id")
      .all() as { id: number; name: string }[];
    expect(names.map((r) => r.name)).toEqual(["Foo", `foo (${names[1].id})`]);
  });
});
