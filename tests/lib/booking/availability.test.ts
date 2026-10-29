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

  it("blocks slots that overlap a booking made before the session got longer", () => {
    const boundary = getTherapyBySlug(db, "boundary-setting-workshop")!;
    createAppointment(db, boundary, input("2026-11-02T10:00:00.000Z"));
    db.update(therapies)
      .set({ durationMinutes: 90 })
      .where(eq(therapies.id, boundary.id))
      .run();

    const open = listOpenSlots(db, getTherapyBySlug(db, boundary.slug)!, NOW);

    expect(open).not.toContain("2026-11-02T09:00:00.000Z");
    expect(open).not.toContain("2026-11-02T11:00:00.000Z");
    expect(open).toContain("2026-11-02T13:00:00.000Z");
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
