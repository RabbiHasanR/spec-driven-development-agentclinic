import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const ailments = sqliteTable(
  "ailments",
  {
    id: integer("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
  },
  // Names are unique ignoring case, so staff can't add a look-alike entry.
  (table) => [
    uniqueIndex("ailments_name_unique").on(sql`lower(${table.name})`),
  ],
);

export const therapies = sqliteTable(
  "therapies",
  {
    id: integer("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    summary: text("summary").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
  },
  (table) => [
    uniqueIndex("therapies_name_unique").on(sql`lower(${table.name})`),
  ],
);

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

/** Where a booking is in the clinic's patient flow. */
export const APPOINTMENT_STATUSES = [
  "booked",
  "attended",
  "no_show",
  "cancelled",
] as const;

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
    status: text("status", { enum: APPOINTMENT_STATUSES })
      .notNull()
      .default("booked"),
    /** When staff last changed `status`; `null` while still `booked`. */
    statusChangedAt: text("status_changed_at"),
  },
  (table) => [
    // One active booking per therapy per slot, enforced by the database so
    // two concurrent submissions can't both succeed. Cancelled bookings are
    // left out, so cancelling frees the slot for another agent.
    uniqueIndex("appointments_therapy_slot_unique")
      .on(table.therapyId, table.startsAt)
      .where(sql`${table.status} <> 'cancelled'`),
    check(
      "appointments_status_check",
      sql.raw(
        `"status" IN (${APPOINTMENT_STATUSES.map((s) => `'${s}'`).join(", ")})`,
      ),
    ),
    // Covers the dashboard's ordering by start time.
    index("appointments_starts_at_idx").on(table.startsAt),
  ],
);

export type NewAilment = typeof ailments.$inferInsert;
export type NewTherapy = typeof therapies.$inferInsert;
export type NewAppointment = typeof appointments.$inferInsert;
