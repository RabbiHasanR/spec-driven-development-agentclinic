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
  INITIAL_BOOKING_FORM_STATE,
  INITIAL_STATUS_FORM_STATE,
} from "@/lib/booking/form-state";
import { SLOT_TAKEN_MESSAGE } from "@/lib/booking/validate";
import type { Db } from "@/lib/db/connection";
import {
  createAppointment,
  getAppointmentByReference,
  listAppointments,
} from "@/lib/db/appointments";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { createTestDb } from "../../helpers/db";

const mocks = vi.hoisted(() => ({
  db: undefined as Db | undefined,
  refresh: vi.fn(),
  requireStaff: vi.fn(async () => {}),
}));

vi.mock("@/lib/db/client", () => ({ getDb: () => mocks.db }));
vi.mock("@/lib/auth/staff", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("next/cache", () => ({ refresh: mocks.refresh }));
vi.mock("next/navigation", () => ({
  RedirectType: { replace: "replace", push: "push" },
  redirect: (url: string, type?: string) => {
    throw new Error(`NEXT_REDIRECT ${type} ${url}`);
  },
}));

const { bookAppointment, changeBookingStatus } =
  await import("@/lib/booking/actions");

// Wednesday 28 October 2026, 12:30 UTC.
const NOW = new Date("2026-10-28T12:30:00.000Z");
const SLOT = "2026-11-02T09:00:00.000Z";
const VALUES = {
  agentName: "Ada",
  agentEmail: "ada@example.com",
  startsAt: SLOT,
};

function form(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(values)) formData.set(name, value);
  return formData;
}

const submit = (values: Record<string, string>, slug = "grounding-session") =>
  bookAppointment(slug, INITIAL_BOOKING_FORM_STATE, form(values));

describe("bookAppointment", () => {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ["Date"], now: NOW });
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    mocks.db = createTestDb();
    mocks.refresh.mockClear();
  });

  it("books the slot and redirects to its confirmation page", async () => {
    const error = await submit(VALUES).catch((e: Error) => e);

    // Replaces the form in history, so Back doesn't reopen it.
    expect(String(error)).toContain("NEXT_REDIRECT replace /bookings/");
    const reference = String(error).match(/\/bookings\/(AC-\w+)$/)?.[1];
    expect(reference).toBeDefined();
    expect(getAppointmentByReference(mocks.db!, reference!)).toMatchObject({
      ...VALUES,
      therapy: { slug: "grounding-session" },
    });
  });

  it("returns field errors and the entered values without booking", async () => {
    const values = { agentName: "", agentEmail: "nope", startsAt: SLOT };

    const state = await submit(values);

    expect(state.values).toEqual(values);
    expect(Object.keys(state.errors).sort()).toEqual([
      "agentEmail",
      "agentName",
    ]);
    expect(listAppointments(mocks.db!)).toEqual([]);
  });

  it("reports a slot taken since the page loaded", async () => {
    const therapy = getTherapyBySlug(mocks.db!, "grounding-session")!;
    createAppointment(mocks.db!, therapy, { ...VALUES, agentName: "Bob" });

    const state = await submit(VALUES);

    expect(state.errors).toEqual({ startsAt: SLOT_TAKEN_MESSAGE });
    // The page refetches its slots and the stale choice isn't re-selected,
    // while the agent's name and email are kept.
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect(state.values).toEqual({ ...VALUES, startsAt: "" });
  });

  it("doesn't refresh the page for name or email errors", async () => {
    const state = await submit({ ...VALUES, agentEmail: "nope" });

    expect(state.values.startsAt).toBe(SLOT);
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("rejects a slot outside the schedule", async () => {
    const state = await submit({
      ...VALUES,
      startsAt: "2026-11-01T09:00:00.000Z",
    });

    expect(state.errors).toEqual({ startsAt: SLOT_TAKEN_MESSAGE });
  });

  it("explains when the therapy no longer exists", async () => {
    const state = await submit(VALUES, "does-not-exist");

    expect(state.message).toBe("This therapy is no longer available.");
  });
});

describe("changeBookingStatus", () => {
  let reference: string;

  const change = (status: string, ref = reference) =>
    changeBookingStatus(ref, INITIAL_STATUS_FORM_STATE, form({ status }));

  beforeAll(() => {
    vi.useFakeTimers({ toFake: ["Date"], now: NOW });
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    mocks.db = createTestDb();
    mocks.refresh.mockClear();
    mocks.requireStaff.mockClear();
    const therapy = getTherapyBySlug(mocks.db, "grounding-session")!;
    const created = createAppointment(mocks.db, therapy, VALUES);
    if (!created.ok) throw new Error("expected a booking");
    reference = created.appointment.reference;
  });

  const statusOf = () =>
    getAppointmentByReference(mocks.db!, reference)?.status;

  it("cancels an upcoming booking and reloads its staff page", async () => {
    const error = await change("cancelled").catch((e: Error) => e);

    expect(mocks.requireStaff).toHaveBeenCalledOnce();
    expect(String(error)).toContain(
      `NEXT_REDIRECT replace /dashboard/bookings/${reference}`,
    );
    expect(statusOf()).toBe("cancelled");
  });

  it("changes nothing without a staff session", async () => {
    mocks.requireStaff.mockRejectedValueOnce(new Error("NEXT_REDIRECT /login"));

    await expect(change("cancelled")).rejects.toThrow("NEXT_REDIRECT /login");
    expect(statusOf()).toBe("booked");
  });

  it("refuses a change the rules don't allow yet", async () => {
    // The slot hasn't started, so it can't be marked attended.
    const state = await change("attended");

    expect(state.message).toBe(
      "That change isn't possible any more. This booking is booked.",
    );
    expect(statusOf()).toBe("booked");
  });

  it("refuses a status that isn't a change", async () => {
    for (const status of ["booked", "bogus"]) {
      expect((await change(status)).message).toMatch(/isn't possible/);
    }
    expect(statusOf()).toBe("booked");
  });

  it("reports a booking another staff member already changed", async () => {
    await change("cancelled").catch(() => {});

    const state = await change("cancelled");

    expect(state.message).toBe(
      "That change isn't possible any more. This booking is cancelled.",
    );
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("explains when the booking doesn't exist", async () => {
    const state = await change("cancelled", "AC-NOPE00");

    expect(state.message).toBe("This booking no longer exists.");
  });
});
