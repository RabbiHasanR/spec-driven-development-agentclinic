import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Enforces the directory rules in specs/tech-stack.md → Project conventions.
// Resolved from the project root: under jsdom, import.meta.url isn't a file URL.
const SRC_DIR = resolve("src");

const srcFiles = readdirSync(SRC_DIR, { recursive: true, encoding: "utf8" });

describe("Project conventions", () => {
  it("keeps tests out of src/", () => {
    expect(srcFiles.filter((file) => /\.test\.[jt]sx?$/.test(file))).toEqual(
      [],
    );
  });

  it("keeps all CSS in src/styles/", () => {
    expect(
      srcFiles.filter(
        (file) => file.endsWith(".css") && !file.startsWith("styles/"),
      ),
    ).toEqual([]);
  });

  it("has no src/pages/ (reserved by the Next.js Pages Router)", () => {
    expect(existsSync(`${SRC_DIR}/pages`)).toBe(false);
  });

  it("has no leftover src/index.ts from the old tsc scaffold", () => {
    expect(existsSync(`${SRC_DIR}/index.ts`)).toBe(false);
  });

  it("imports Drizzle and better-sqlite3 only from src/lib/db/", () => {
    expect(
      srcFiles.filter(
        (file) =>
          /\.tsx?$/.test(file) &&
          !file.startsWith("lib/db/") &&
          /from "(drizzle-orm|better-sqlite3)/.test(
            readFileSync(`${SRC_DIR}/${file}`, "utf8"),
          ),
      ),
    ).toEqual([]);
  });
});
