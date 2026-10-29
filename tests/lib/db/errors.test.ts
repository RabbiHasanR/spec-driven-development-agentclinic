// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/db/errors";

describe("isUniqueViolation", () => {
  it("recognizes a unique violation wrapped by Drizzle", () => {
    const sqliteError = Object.assign(
      new Error("UNIQUE constraint failed: appointments.reference"),
      { code: "SQLITE_CONSTRAINT_UNIQUE" },
    );
    const wrapped = new Error("Failed query: insert …", { cause: sqliteError });

    expect(isUniqueViolation(wrapped, "appointments.reference")).toBe(true);
    expect(isUniqueViolation(wrapped, "appointments.starts_at")).toBe(false);
    expect(
      isUniqueViolation(new Error("other"), "appointments.reference"),
    ).toBe(false);
  });
});

describe("isForeignKeyViolation", () => {
  it.each(["SQLITE_CONSTRAINT_TRIGGER", "SQLITE_CONSTRAINT_FOREIGNKEY"])(
    "recognizes SQLite's %s foreign key error",
    (code) => {
      const error = Object.assign(new Error("FOREIGN KEY constraint failed"), {
        code,
      });
      expect(isForeignKeyViolation(error)).toBe(true);
    },
  );

  it("ignores other constraint errors", () => {
    const error = Object.assign(new Error("UNIQUE constraint failed: x"), {
      code: "SQLITE_CONSTRAINT_UNIQUE",
    });
    expect(isForeignKeyViolation(error)).toBe(false);
  });
});
