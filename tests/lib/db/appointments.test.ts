// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createAppointment,
  getAppointmentByReference,
  isUniqueViolation,
  listAppointments,
  listBookedSlots,
  listOpenSlots,
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

describe("appointment queries", () => {
  let db: Db;
  let grounding: Therapy;
  let cooldown: Therapy;

  beforeEach(() => {
    db = createTestDb();
    grounding = getTherapyBySlug(db, "grounding-session")!;
    cooldown = getTherapyBySlug(db, "cooldown-retreat")!;
  });

  it("finds a therapy by slug, and nothing for an unknown slug", () => {
    expect(grounding.name).toBe("Grounding Session");
    expect(getTherapyBySlug(db, "does-not-exist")).toBeUndefined();
  });

  it("stores a booking with a unique reference", () => {
    const first = createAppointment(db, grounding, input(), { now: NOW });
    const second = createAppointment(
      db,
      grounding,
      input(SLOT.replace("09", "10")),
    );

    expect(first).toMatchObject({
      ok: true,
      appointment: {
        ...input(),
        therapyId: grounding.id,
        createdAt: NOW.toISOString(),
        therapy: grounding,
      },
    });
    if (!first.ok || !second.ok) throw new Error("expected bookings");
    expect(first.appointment.reference).toMatch(/^AC-/);
    expect(first.appointment.reference).not.toBe(second.appointment.reference);
  });

  it("returns slot-taken when the therapy's slot is already booked", () => {
    createAppointment(db, grounding, input());

    expect(createAppointment(db, grounding, input())).toEqual({
      ok: false,
      reason: "slot-taken",
    });
  });

  it("allows the same time for a different therapy", () => {
    createAppointment(db, grounding, input());

    expect(createAppointment(db, cooldown, input()).ok).toBe(true);
  });

  it("retries with a new reference when one is already used", () => {
    const codes = ["AC-AAAAAA", "AC-AAAAAA", "AC-BBBBBB"];
    const generateReference = () => codes.shift()!;
    createAppointment(db, grounding, input(), { generateReference });

    const result = createAppointment(db, cooldown, input(), {
      generateReference,
    });

    expect(result.ok && result.appointment.reference).toBe("AC-BBBBBB");
  });

  it("gives up if every reference it tries is taken", () => {
    createAppointment(db, grounding, input(), {
      generateReference: () => "AC-AAAAAA",
    });

    expect(() =>
      createAppointment(db, cooldown, input(), {
        generateReference: () => "AC-AAAAAA",
      }),
    ).toThrow("Couldn't generate an unused booking reference.");
  });

  it("lists only that therapy's booked slots, earliest first", () => {
    createAppointment(db, grounding, input("2026-11-03T09:00:00.000Z"));
    createAppointment(db, grounding, input());
    createAppointment(db, cooldown, input("2026-11-04T09:00:00.000Z"));

    expect(listBookedSlots(db, grounding.id)).toEqual([
      SLOT,
      "2026-11-03T09:00:00.000Z",
    ]);
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

  it("recognizes a unique violation wrapped by Drizzle", () => {
    const sqliteError = Object.assign(
      new Error("UNIQUE constraint failed: appointments.reference"),
      { code: "SQLITE_CONSTRAINT_UNIQUE" },
    );
    const wrapped = new Error("Failed query: insert …", { cause: sqliteError });

    expect(isUniqueViolation(wrapped, "appointments.reference")).toBe(true);
    expect(isUniqueViolation(wrapped, "appointments.starts_at")).toBe(false);
    expect(
      isUniqueViolation(new Error("other"), "appointments.reference"),
    ).toBe(false);
  });

  it("finds a booking by reference with its therapy", () => {
    const created = createAppointment(db, grounding, input());
    if (!created.ok) throw new Error("expected a booking");

    expect(
      getAppointmentByReference(db, created.appointment.reference),
    ).toEqual(created.appointment);
    expect(getAppointmentByReference(db, "AC-NOPE00")).toBeUndefined();
  });

  it("blocks deleting a therapy that has bookings", () => {
    createAppointment(db, grounding, input());

    expect(() =>
      db.delete(therapies).where(eq(therapies.id, grounding.id)).run(),
    ).toThrow(/FOREIGN KEY/);
  });

  it("lists every booking with its therapy, earliest first", () => {
    createAppointment(db, cooldown, input("2026-11-04T09:00:00.000Z"));
    createAppointment(db, grounding, input());

    expect(
      listAppointments(db).map((a) => [a.startsAt, a.therapy.slug]),
    ).toEqual([
      [SLOT, "grounding-session"],
      ["2026-11-04T09:00:00.000Z", "cooldown-retreat"],
    ]);
  });
});
