// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createAppointment,
  getAppointmentByReference,
  listAppointments,
  listBookedSlots,
  updateAppointmentStatus,
} from "@/lib/db/appointments";
import { appointments, therapies } from "@/lib/db/schema";
import type { Db } from "@/lib/db/connection";
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

  it("stores a booking with a unique reference", () => {
    const first = createAppointment(db, grounding, input(), { now: NOW });
    const second = createAppointment(
      db,
      grounding,
      input("2026-11-02T10:00:00.000Z"),
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

  it("stores new bookings as booked, with no status change yet", () => {
    const created = createAppointment(db, grounding, input());

    expect(created.ok && created.appointment).toMatchObject({
      status: "booked",
      statusChangedAt: null,
    });
  });

  it("frees a cancelled slot for another booking", () => {
    const first = createAppointment(db, grounding, input());
    if (!first.ok) throw new Error("expected a booking");
    updateAppointmentStatus(
      db,
      first.appointment.reference,
      "booked",
      "cancelled",
      NOW,
    );

    expect(listBookedSlots(db, grounding.id)).toEqual([]);
    expect(createAppointment(db, grounding, input()).ok).toBe(true);
    // The slot is held again: a second active booking is still refused.
    expect(createAppointment(db, grounding, input())).toEqual({
      ok: false,
      reason: "slot-taken",
    });
  });

  it("changes status only from the status the caller saw", () => {
    const created = createAppointment(db, grounding, input());
    if (!created.ok) throw new Error("expected a booking");
    const { reference } = created.appointment;

    expect(
      updateAppointmentStatus(db, reference, "booked", "attended", NOW),
    ).toBe(true);
    // A second, stale click finds it already changed.
    expect(
      updateAppointmentStatus(db, reference, "booked", "no_show", NOW),
    ).toBe(false);
    expect(getAppointmentByReference(db, reference)).toMatchObject({
      status: "attended",
      statusChangedAt: NOW.toISOString(),
    });
  });

  it("rejects an unknown status in the database itself", () => {
    createAppointment(db, grounding, input());

    expect(() =>
      db
        .update(appointments)
        .set({ status: "bogus" as "booked" })
        .run(),
    ).toThrow(/CHECK constraint/);
  });
});
