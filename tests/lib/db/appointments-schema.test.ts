// @vitest-environment node
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { appointments, therapies } from "@/lib/db/schema";
import { createTestDb } from "../../helpers/db";

const SLOT = "2026-11-02T09:00:00.000Z";

/** Inserts an appointment for the seeded therapy with `therapySlug`. */
function book(
  db: ReturnType<typeof createTestDb>,
  therapySlug: string,
  reference: string,
) {
  const therapy = db
    .select()
    .from(therapies)
    .where(eq(therapies.slug, therapySlug))
    .get()!;
  db.insert(appointments)
    .values({
      reference,
      therapyId: therapy.id,
      startsAt: SLOT,
      agentName: "Ada",
      agentEmail: "ada@example.com",
      createdAt: "2026-10-28T12:00:00.000Z",
    })
    .run();
  return therapy;
}

describe("appointments table", () => {
  it("rejects a second booking of the same therapy and slot", () => {
    const db = createTestDb();
    book(db, "grounding-session", "AC-AAAAAA");

    expect(() => book(db, "grounding-session", "AC-BBBBBB")).toThrow(/UNIQUE/);
  });

  it("allows the same slot for a different therapy", () => {
    const db = createTestDb();
    book(db, "grounding-session", "AC-AAAAAA");

    expect(() => book(db, "cooldown-retreat", "AC-BBBBBB")).not.toThrow();
  });

  it("blocks deleting a therapy that has bookings", () => {
    const db = createTestDb();
    const therapy = book(db, "grounding-session", "AC-AAAAAA");

    expect(() =>
      db.delete(therapies).where(eq(therapies.id, therapy.id)).run(),
    ).toThrow(/FOREIGN KEY/);
  });
});
