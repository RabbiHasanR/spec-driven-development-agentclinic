import { createDb, getDatabasePath } from "@/lib/db/connection";
import { seedDb } from "@/lib/db/seed";

seedDb(createDb(getDatabasePath()));
console.log("Seed data loaded.");
