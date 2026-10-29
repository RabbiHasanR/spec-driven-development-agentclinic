// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listOpenSlots } from "@/lib/booking/availability";
import {
  createAppointment,
  updateAppointmentStatus,
} from "@/lib/db/appointments";
import type { Db } from "@/lib/db/connection";
import { therapies } from "@/lib/db/schema";
import { getTherapyBySlug } from "@/lib/db/therapies";
import type { Therapy } from "@/lib/db/types";
import { createTestDb } from "../../helpers/db";

// Wednesday 28 October 2026, 12:30 UTC.
const NOW = new Date("2026-10-28T12:30:00.000Z");
const SLOT = "2026-11-02T09:00:00.000Z";

const input = (startsAt = SLOT) => ({
  agentName: "Ada",
  agentEmail: "ada@example.com",
  startsAt,
});

describe("listOpenSlots", () => {
  let db: Db;
  let grounding: Therapy;
  let cooldown: Therapy;

  beforeEach(() => {
    db = createTestDb();
    grounding = getTherapyBySlug(db, "grounding-session")!;
    cooldown = getTherapyBySlug(db, "cooldown-retreat")!;
  });
  it("leaves booked slots out of the open slots", () => {
    const before = listOpenSlots(db, grounding, NOW);
    createAppointment(db, grounding, input());

    const after = listOpenSlots(db, grounding, NOW);
    expect(before).toContain(SLOT);
    expect(after).not.toContain(SLOT);
    expect(after).toHaveLength(before.length - 1);
    expect(listOpenSlots(db, cooldown, NOW)).toContain(SLOT);
  });

  /** Sets a therapy's length, as a staff edit would, and reloads it. */
  function setLength(therapy: Therapy, durationMinutes: number): Therapy {
    db.update(therapies)
      .set({ durationMinutes })
      .where(eq(therapies.id, therapy.id))
      .run();
    return getTherapyBySlug(db, therapy.slug)!;
  }

  it("blocks slots a longer session would run into, but not after the booking ends", () => {
    const boundary = getTherapyBySlug(db, "boundary-setting-workshop")!;
    createAppointment(
      db,
      setLength(boundary, 60),
      input("2026-11-02T10:00:00.000Z"),
    );

    const open = listOpenSlots(db, setLength(boundary, 90), NOW);

    // The booking is 10:00–11:00: a 90-minute 09:00 session would overlap it.
    expect(open).not.toContain("2026-11-02T09:00:00.000Z");
    expect(open).toContain("2026-11-02T11:00:00.000Z");
  });

  it("keeps a booking's full length blocked after the session got shorter", () => {
    const cooldown = getTherapyBySlug(db, "cooldown-retreat")!;
    createAppointment(
      db,
      setLength(cooldown, 120),
      input("2026-11-02T13:00:00.000Z"),
    );

    const open = listOpenSlots(db, setLength(cooldown, 60), NOW);

    // Still 13:00–15:00: nobody can be booked into 14:00.
    expect(open).not.toContain("2026-11-02T14:00:00.000Z");
    expect(open).toContain("2026-11-02T15:00:00.000Z");
  });

  it("offers a cancelled booking's slot again", () => {
    const created = createAppointment(db, grounding, input());
    if (!created.ok) throw new Error("expected a booking");
    updateAppointmentStatus(
      db,
      created.appointment.reference,
      "booked",
      "cancelled",
      NOW,
    );

    expect(listOpenSlots(db, grounding, NOW)).toContain(SLOT);
  });
});
