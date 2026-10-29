// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { createAilment, getAilmentBySlug } from "@/lib/db/ailments";
import {
  createAppointment,
  updateAppointmentStatus,
} from "@/lib/db/appointments";
import type { Db } from "@/lib/db/connection";
import {
  createTherapy,
  deleteTherapy,
  getTherapyBySlug,
  listTherapies,
  updateTherapy,
} from "@/lib/db/therapies";
import { createTestDb } from "../../helpers/db";

describe("therapy queries", () => {
  it("shows a therapy shared by two ailments on both", () => {
    const db = createTestDb();
    const slugsFor = (ailmentSlug: string) =>
      getAilmentBySlug(db, ailmentSlug)?.therapies.map((t) => t.slug);

    expect(slugsFor("context-window-overflow")).toContain(
      "context-decompression",
    );
    expect(slugsFor("prompt-fatigue")).toContain("context-decompression");
  });

  it("finds a therapy by slug, and nothing for an unknown slug", () => {
    const db = createTestDb();
    expect(getTherapyBySlug(db, "grounding-session")?.name).toBe(
      "Grounding Session",
    );
    expect(getTherapyBySlug(db, "does-not-exist")).toBeUndefined();
  });
});

describe("therapy writes", () => {
  let db: Db;
  const fields = {
    name: "Rate Limit Rest",
    summary: "Breathe.",
    durationMinutes: 30,
  };

  beforeEach(() => {
    db = createTestDb();
  });

  /** An ailment linked only to `therapySlug`. */
  function strandOn(therapySlug: string) {
    const therapy = getTherapyBySlug(db, therapySlug)!;
    const result = createAilment(
      db,
      {
        name: "Single Option Syndrome",
        summary: "s",
        description: "d",
        therapyIds: [therapy.id],
      },
      "single-option-syndrome",
    );
    if (!result.ok) throw new Error("expected an ailment");
    return therapy;
  }

  it("lists every therapy by name", () => {
    const names = listTherapies(db).map((t) => t.name);

    expect(names).toEqual([...names].sort());
    expect(names).toHaveLength(8);
  });

  it("creates a therapy with a free slug", () => {
    const result = createTherapy(db, fields, "grounding-session");

    expect(result.ok && result.value).toMatchObject({
      ...fields,
      slug: "grounding-session-2",
    });
  });

  it("refuses a name another therapy has, in any case", () => {
    expect(
      createTherapy(db, { ...fields, name: "grounding SESSION" }, "x"),
    ).toEqual({ ok: false, reason: "name-taken" });
  });

  it("updates fields but never the slug", () => {
    const { id } = getTherapyBySlug(db, "grounding-session")!;

    const result = updateTherapy(db, id, { ...fields, durationMinutes: 60 });

    expect(result.ok && result.value).toMatchObject({
      slug: "grounding-session",
      name: "Rate Limit Rest",
      durationMinutes: 60,
    });
  });

  it("deletes a therapy with no bookings, and its links", () => {
    const { id } = getTherapyBySlug(db, "grounding-session")!;

    expect(deleteTherapy(db, id)).toEqual({ ok: true });
    expect(getTherapyBySlug(db, "grounding-session")).toBeUndefined();
  });

  it("refuses to delete a therapy with bookings of any status", () => {
    const therapy = getTherapyBySlug(db, "grounding-session")!;
    const booked = createAppointment(db, therapy, {
      agentName: "Ada",
      agentEmail: "ada@example.com",
      startsAt: "2026-11-02T09:00:00.000Z",
    });
    if (!booked.ok) throw new Error("expected a booking");
    updateAppointmentStatus(
      db,
      booked.appointment.reference,
      "booked",
      "cancelled",
      new Date(),
    );

    expect(deleteTherapy(db, therapy.id)).toEqual({
      ok: false,
      reason: "has-bookings",
    });
    // Nothing changed, links included.
    expect(getTherapyBySlug(db, "grounding-session")).toEqual(therapy);
    expect(
      getAilmentBySlug(db, "hallucination-anxiety")?.therapies.map(
        (t) => t.slug,
      ),
    ).toContain("grounding-session");
  });

  it("refuses to delete an ailment's only therapy, naming the ailment", () => {
    const therapy = strandOn("cooldown-retreat");

    expect(deleteTherapy(db, therapy.id)).toEqual({
      ok: false,
      reason: "sole-therapy",
      ailments: ["Single Option Syndrome"],
    });
  });
});
