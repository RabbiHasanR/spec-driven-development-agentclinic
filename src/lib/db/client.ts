import "server-only";
import { createDb, getDatabasePath, type Db } from "./connection";

// Survives dev hot reloads so each reload doesn't open another connection.
const globalForDb = globalThis as typeof globalThis & { agentclinicDb?: Db };

/** The app's shared database client. Server-only. */
export function getDb(): Db {
  globalForDb.agentclinicDb ??= createDb(getDatabasePath());
  return globalForDb.agentclinicDb;
}
