import { createDb, getDatabasePath } from "@/lib/db/connection";
import { migrateDb } from "@/lib/db/migrate";

migrateDb(createDb(getDatabasePath(), { create: true }));
console.log("Migrations applied.");
