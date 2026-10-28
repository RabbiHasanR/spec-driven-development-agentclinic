// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createAppointment } from "@/lib/db/appointments";
import type { Db } from "@/lib/db/connection";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { createTestDb } from "../../../helpers/db";

const mocks = vi.hoisted(() => ({ db: undefined as Db | undefined }));

vi.mock("@/lib/db/client", () => ({ getDb: () => mocks.db }));
vi.mock("next/server", () => ({ connection: async () => {} }));

const { default: Page, metadata } =
  await import("@/app/(staff)/dashboard/page");

describe("/dashboard route", () => {
  beforeAll(() => {
    vi.useFakeTimers({
      toFake: ["Date"],
      now: new Date("2026-10-28T12:30:00Z"),
    });
    mocks.db = createTestDb();
    const therapy = getTherapyBySlug(mocks.db, "grounding-session")!;
    for (const startsAt of [
      "2026-10-27T09:00:00.000Z",
      "2026-11-02T09:00:00.000Z",
    ]) {
      createAppointment(mocks.db, therapy, {
        agentName: "Ada",
        agentEmail: "ada@example.com",
        startsAt,
      });
    }
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("keeps the page, which lists contact details, out of search engines", () => {
    expect(metadata).toEqual({ title: "Dashboard", robots: { index: false } });
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
