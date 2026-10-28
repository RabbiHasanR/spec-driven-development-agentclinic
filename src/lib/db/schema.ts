import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const ailments = sqliteTable("ailments", {
  id: integer("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
});

export const therapies = sqliteTable("therapies", {
  id: integer("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  summary: text("summary").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
});

/** Many-to-many link: which therapies treat which ailments. */
export const ailmentTherapies = sqliteTable(
  "ailment_therapy",
  {
    ailmentId: integer("ailment_id")
      .notNull()
      .references(() => ailments.id, { onDelete: "cascade" }),
    therapyId: integer("therapy_id")
      .notNull()
      .references(() => therapies.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.ailmentId, table.therapyId] })],
);

export type Ailment = typeof ailments.$inferSelect;
export type NewAilment = typeof ailments.$inferInsert;
export type Therapy = typeof therapies.$inferSelect;
export type NewTherapy = typeof therapies.$inferInsert;
export type AilmentWithTherapies = Ailment & { therapies: Therapy[] };
