import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Enforces the directory rules in specs/tech-stack.md → Project conventions.
// Resolved from the project root: under jsdom, import.meta.url isn't a file URL.
const SRC_DIR = resolve("src");

const srcFiles = readdirSync(SRC_DIR, { recursive: true, encoding: "utf8" });

/** Source files (relative to src/) whose text matches `pattern`. */
function sourcesMatching(pattern: RegExp): string[] {
  return srcFiles.filter(
    (file) =>
      /\.tsx?$/.test(file) &&
      pattern.test(readFileSync(`${SRC_DIR}/${file}`, "utf8")),
  );
}

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

  it("spells URL paths only in src/lib/routes.ts", () => {
    expect(
      sourcesMatching(/href="\//).filter((file) => file !== "lib/routes.ts"),
    ).toEqual([]);
  });

  it("uses color tokens, never raw Tailwind palette colors", () => {
    expect(
      sourcesMatching(
        /\b(?:text|bg|ring|border|outline|divide|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
      ),
    ).toEqual([]);
  });

  it("keeps src/lib/db/ free of domain and UI imports", () => {
    expect(
      sourcesMatching(/from "@\/(?:lib\/(?!db\/)|components|views|app)/).filter(
        (file) => file.startsWith("lib/db/"),
      ),
    ).toEqual([]);
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
