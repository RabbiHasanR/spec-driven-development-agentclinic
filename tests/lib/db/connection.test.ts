// @vitest-environment node
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDb, getDatabasePath } from "@/lib/db/connection";

describe("createDb", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "agentclinic-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("refuses to open a missing file instead of creating an empty one", () => {
    const path = join(dir, "missing.db");

    expect(() => createDb(path)).toThrow(/npm run db:migrate/);
    expect(existsSync(path)).toBe(false);
  });

  it("creates the file and its directory when asked to", () => {
    const path = join(dir, "nested", "app.db");

    createDb(path, { create: true });

    expect(existsSync(path)).toBe(true);
  });

  it("enforces foreign keys", () => {
    const db = createDb(join(dir, "app.db"), { create: true });

    expect(db.$client.pragma("foreign_keys", { simple: true })).toBe(1);
  });
});

describe("getDatabasePath", () => {
  const original = process.env.DATABASE_URL;

  afterEach(() => {
    process.env.DATABASE_URL = original;
  });

  it("throws a setup hint when DATABASE_URL is unset", () => {
    delete process.env.DATABASE_URL;

    expect(() => getDatabasePath()).toThrow(/\.env\.example/);
  });
});
