// @vitest-environment node
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  createAppointment,
  getAppointmentByReference,
} from "@/lib/db/appointments";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { signInStaff, signOutStaff } from "@tests/helpers/auth";
import { createTestDb, testDb } from "@tests/helpers/db";

vi.mock("@/lib/db/client", () =>
  import("@tests/helpers/db").then((m) => m.client),
);
vi.mock("next/headers", () =>
  import("@tests/helpers/auth").then((m) => m.headers),
);
vi.mock("next/server", () =>
  import("@tests/helpers/next").then((m) => m.server),
);
vi.mock("next/navigation", () =>
  import("@tests/helpers/next").then((m) => m.navigation),
);
vi.mock("next/cache", () => ({ refresh: () => {} }));

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
    testDb.current = createTestDb();
    const therapy = getTherapyBySlug(testDb.current, "grounding-session")!;
    const result = createAppointment(testDb.current, therapy, {
      agentName: "Ada",
      agentEmail: "ada@example.com",
      startsAt: "2026-11-02T09:00:00.000Z",
    });
    if (!result.ok) throw new Error("expected a booking");
    reference = result.appointment.reference;
  });

  beforeEach(signInStaff);

  afterAll(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("sends a visitor without a staff session to the login page", async () => {
    signOutStaff();

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

  it("offers the changes allowed now, bound to this booking", async () => {
    const element = await Page(propsFor(reference));

    expect(element.props.appointment).toMatchObject({ reference });
    // Upcoming, so it can only be cancelled.
    expect(element.props.allowed).toEqual(["cancelled"]);

    const formData = new FormData();
    formData.set("status", "cancelled");
    await expect(element.props.action({}, formData)).rejects.toThrow(
      `NEXT_REDIRECT replace /dashboard/bookings/${reference}`,
    );
    expect(getAppointmentByReference(testDb.current!, reference)?.status).toBe(
      "cancelled",
    );
  });

  it("calls notFound() for an unknown reference", async () => {
    await expect(Page(propsFor("AC-NOPE00"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
