// @vitest-environment node
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createAppointment } from "@/lib/db/appointments";
import type { Db } from "@/lib/db/connection";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { createTestDb } from "../../../../../helpers/db";

const mocks = vi.hoisted(() => ({
  db: undefined as Db | undefined,
  requireStaff: vi.fn(async () => {}),
}));

vi.mock("@/lib/db/client", () => ({ getDb: () => mocks.db }));
vi.mock("@/lib/auth/staff", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const { default: Page, generateMetadata } =
  await import("@/app/(staff)/dashboard/bookings/[reference]/page");

const propsFor = (reference: string) => ({
  params: Promise.resolve({ reference }),
  searchParams: Promise.resolve({}),
});

describe("/dashboard/bookings/[reference] route", () => {
  let reference: string;

  beforeAll(() => {
    vi.useFakeTimers({
      toFake: ["Date"],
      now: new Date("2026-10-28T12:30:00Z"),
    });
    mocks.db = createTestDb();
    const therapy = getTherapyBySlug(mocks.db, "grounding-session")!;
    const result = createAppointment(mocks.db, therapy, {
      agentName: "Ada",
      agentEmail: "ada@example.com",
      startsAt: "2026-11-02T09:00:00.000Z",
    });
    if (!result.ok) throw new Error("expected a booking");
    reference = result.appointment.reference;
  });

  beforeEach(() => {
    mocks.requireStaff.mockClear();
  });

  it("requires a staff session before loading the booking", async () => {
    mocks.requireStaff.mockRejectedValueOnce(new Error("NEXT_REDIRECT /login"));

    await expect(Page(propsFor(reference))).rejects.toThrow(
      "NEXT_REDIRECT /login",
    );
  });

  it("keeps the page, which shows contact details, out of search engines", async () => {
    expect(await generateMetadata(propsFor(reference))).toEqual({
      title: `Booking ${reference}`,
      robots: { index: false },
    });
  });

  it("renders the booking with the changes allowed now", async () => {
    const element = await Page(propsFor(reference));

    expect(mocks.requireStaff).toHaveBeenCalled();
    expect(element.props.appointment).toMatchObject({ reference });
    // Upcoming, so it can only be cancelled.
    expect(element.props.allowed).toEqual(["cancelled"]);
    expect(element.props.action).toBeTypeOf("function");
  });

  it("calls notFound() for an unknown reference", async () => {
    await expect(Page(propsFor("AC-NOPE00"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
