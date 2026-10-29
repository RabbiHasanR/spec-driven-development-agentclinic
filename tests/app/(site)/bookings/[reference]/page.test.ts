// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  createAppointment,
  updateAppointmentStatus,
} from "@/lib/db/appointments";
import type { Db } from "@/lib/db/connection";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { createTestDb } from "../../../../helpers/db";

const mocks = vi.hoisted(() => ({ db: undefined as Db | undefined }));

vi.mock("@/lib/db/client", () => ({ getDb: () => mocks.db }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const { default: Page, generateMetadata } =
  await import("@/app/(site)/bookings/[reference]/page");

const propsFor = (reference: string) => ({
  params: Promise.resolve({ reference }),
  searchParams: Promise.resolve({}),
});

describe("/bookings/[reference] route", () => {
  let reference: string;
  let cancelledReference: string;

  beforeAll(() => {
    mocks.db = createTestDb();
    const therapy = getTherapyBySlug(mocks.db, "grounding-session")!;
    const result = createAppointment(mocks.db, therapy, {
      agentName: "Ada",
      agentEmail: "ada@example.com",
      startsAt: "2026-11-02T09:00:00.000Z",
    });
    if (!result.ok) throw new Error("expected a booking");
    reference = result.appointment.reference;
    const second = createAppointment(mocks.db, therapy, {
      agentName: "Bob",
      agentEmail: "bob@example.com",
      startsAt: "2026-11-03T09:00:00.000Z",
    });
    if (!second.ok) throw new Error("expected a booking");
    cancelledReference = second.appointment.reference;
  });

  it("keeps the page, which shows contact details, out of search engines", async () => {
    expect(await generateMetadata(propsFor(reference))).toEqual({
      title: "Booking confirmed",
      robots: { index: false },
    });
  });

  it("titles a cancelled booking as cancelled", async () => {
    updateAppointmentStatus(
      mocks.db!,
      cancelledReference,
      "booked",
      "cancelled",
      new Date(),
    );

    expect(await generateMetadata(propsFor(cancelledReference))).toEqual({
      title: "Booking cancelled",
      robots: { index: false },
    });
  });

  it("renders the confirmation for the booking", async () => {
    const element = await Page(propsFor(reference));

    expect(element.props.appointment).toMatchObject({
      reference,
      agentName: "Ada",
      therapy: { slug: "grounding-session" },
    });
  });

  it("calls notFound() for an unknown reference", async () => {
    await expect(Page(propsFor("AC-NOPE00"))).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(generateMetadata(propsFor("AC-NOPE00"))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
