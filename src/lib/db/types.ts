import type { ailments, therapies } from "./schema";

// View-facing row types. UI code imports these instead of the schema, so
// tables can gain internal columns without leaking them into components.

export type Ailment = typeof ailments.$inferSelect;
export type Therapy = typeof therapies.$inferSelect;
export type AilmentWithTherapies = Ailment & { therapies: Therapy[] };
