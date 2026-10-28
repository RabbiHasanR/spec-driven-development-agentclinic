// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Db } from "@/lib/db/connection";
import { createTestDb } from "../../../../../helpers/db";

const mocks = vi.hoisted(() => ({ db: undefined as Db | undefined }));

vi.mock("@/lib/db/client", () => ({ getDb: () => mocks.db }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: vi.fn(),
}));

const { default: Page, generateMetadata } =
  await import("@/app/(site)/therapies/[slug]/book/page");

const propsFor = (slug: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});

describe("/therapies/[slug]/book route", () => {
  beforeAll(() => {
    // Wednesday 28 October 2026, 12:30 UTC.
    vi.useFakeTimers({
      toFake: ["Date"],
      now: new Date("2026-10-28T12:30:00Z"),
    });
    mocks.db = createTestDb();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("titles the page with the therapy's name", async () => {
    expect(await generateMetadata(propsFor("grounding-session"))).toEqual({
      title: "Book Grounding Session",
      description: expect.any(String),
    });
  });

  it("renders the booking view with open slots and a bound action", async () => {
    const element = await Page(propsFor("grounding-session"));

    expect(element.props.therapy.slug).toBe("grounding-session");
    expect(element.props.slots[0]).toBe("2026-10-28T13:00:00.000Z");
    expect(element.props.action).toBeTypeOf("function");
  });

  it("calls notFound() for an unknown slug", async () => {
    await expect(Page(propsFor("does-not-exist"))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    await expect(generateMetadata(propsFor("does-not-exist"))).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });
});
