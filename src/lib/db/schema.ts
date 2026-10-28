import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
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
  (table) => [
    primaryKey({ columns: [table.ailmentId, table.therapyId] }),
    // The primary key covers lookups by ailment; this covers lookups and
    // cascading deletes by therapy.
    index("ailment_therapy_therapy_id_idx").on(table.therapyId),
  ],
);

/** A booked therapy slot. Times are ISO 8601 UTC strings. */
export const appointments = sqliteTable(
  "appointments",
  {
    id: integer("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    therapyId: integer("therapy_id")
      .notNull()
      // Deleting a therapy must never silently drop its bookings.
      .references(() => therapies.id, { onDelete: "restrict" }),
    startsAt: text("starts_at").notNull(),
    agentName: text("agent_name").notNull(),
    agentEmail: text("agent_email").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    // One booking per therapy per slot, enforced by the database so two
    // concurrent submissions can't both succeed.
    uniqueIndex("appointments_therapy_slot_unique").on(
      table.therapyId,
      table.startsAt,
    ),
    // Covers the dashboard's ordering by start time.
    index("appointments_starts_at_idx").on(table.startsAt),
  ],
);

export type NewAilment = typeof ailments.$inferInsert;
export type NewTherapy = typeof therapies.$inferInsert;
export type NewAppointment = typeof appointments.$inferInsert;
