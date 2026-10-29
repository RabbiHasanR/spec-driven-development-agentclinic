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
import { createAppointment } from "@/lib/db/appointments";
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

const { default: Page, metadata } =
  await import("@/app/(staff)/dashboard/page");

describe("/dashboard route", () => {
  beforeAll(() => {
    vi.useFakeTimers({
      toFake: ["Date"],
      now: new Date("2026-10-28T12:30:00Z"),
    });
    testDb.current = createTestDb();
    const therapy = getTherapyBySlug(testDb.current, "grounding-session")!;
    for (const startsAt of [
      "2026-10-27T09:00:00.000Z",
      "2026-11-02T09:00:00.000Z",
    ]) {
      createAppointment(testDb.current, therapy, {
        agentName: "Ada",
        agentEmail: "ada@example.com",
        startsAt,
      });
    }
  });

  beforeEach(signInStaff);

  afterAll(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("keeps the page, which lists contact details, out of search engines", () => {
    expect(metadata).toEqual({ title: "Dashboard", robots: { index: false } });
  });

  it("sends a visitor without a staff session to the login page", async () => {
    signOutStaff();

    await expect(Page()).rejects.toThrow("NEXT_REDIRECT /login");
  });

  it("renders the schedule split around now, with its overview", async () => {
    const element = await Page();

    expect(element.props.schedule.upcoming).toHaveLength(1);
    expect(element.props.schedule.past).toHaveLength(1);
    expect(element.props.overview).toEqual({
      today: 0,
      upcoming: 1,
      busiestTherapy: { name: "Grounding Session", count: 1 },
    });
  });
});
