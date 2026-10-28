import { createDb, getDatabasePath } from "@/lib/db/connection";
import { migrateDb } from "@/lib/db/migrate";

migrateDb(createDb(getDatabasePath()));
console.log("Migrations applied.");
