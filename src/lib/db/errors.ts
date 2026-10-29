// Recognizing SQLite constraint errors, so queries can turn the ones they
// expect into results instead of letting them throw.

import type { SaveResult } from "./types";

/**
 * The SQLite error behind `error`. Drizzle throws the driver's error as-is
 * here, but some of its sessions wrap it in a `DrizzleQueryError` with the
 * original as `cause`; both are handled.
 */
function sqliteCause(error: unknown): (Error & { code?: string }) | undefined {
  const cause = error instanceof Error && error.cause ? error.cause : error;
  return cause instanceof Error ? cause : undefined;
}

/**
 * Whether `error` is SQLite rejecting a duplicate for `target`.
 *
 * @param target - A column (`appointments.reference`) or an index name
 *   (`ailments_name_unique`), as SQLite names it in the message, e.g.
 *   "UNIQUE constraint failed: appointments.therapy_id, appointments.starts_at"
 *   or "UNIQUE constraint failed: index 'ailments_name_unique'".
 */
export function isUniqueViolation(error: unknown, target: string): boolean {
  const cause = sqliteCause(error);
  return (
    cause?.code === "SQLITE_CONSTRAINT_UNIQUE" && cause.message.includes(target)
  );
}

/**
 * Whether `error` is SQLite refusing a change that breaks a foreign key.
 *
 * Matched on the message, not the code: SQLite reports an `ON DELETE
 * RESTRICT` violation as `SQLITE_CONSTRAINT_TRIGGER` (RESTRICT runs through
 * its trigger machinery) and other violations as
 * `SQLITE_CONSTRAINT_FOREIGNKEY`, both with "FOREIGN KEY constraint failed".
 */
export function isForeignKeyViolation(error: unknown): boolean {
  const cause = sqliteCause(error);
  return (
    !!cause?.code?.startsWith("SQLITE_CONSTRAINT") &&
    cause.message.includes("FOREIGN KEY constraint failed")
  );
}

/**
 * Runs a catalog save, turning a duplicate name into a `name-taken` result.
 *
 * @param save - Inserts or updates the row and returns it.
 * @param nameIndex - The table's unique name index, e.g. `ailments_name_unique`.
 */
export function saveUnlessNameTaken<T>(
  save: () => T,
  nameIndex: string,
): SaveResult<T> {
  try {
    return { ok: true, value: save() };
  } catch (error) {
    if (isUniqueViolation(error, nameIndex)) {
      return { ok: false, reason: "name-taken" };
    }
    throw error;
  }
}
