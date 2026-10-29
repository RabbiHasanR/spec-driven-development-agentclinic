// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/lib/db/connection";
import { createTestDb } from "../../../../../../../helpers/db";

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
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
}));

beforeEach(() => {
  mocks.db = createTestDb();
  mocks.requireStaff.mockReset();
  mocks.requireStaff.mockResolvedValue(undefined);
});

/** Makes the next requireStaff() call reject, as it does when signed out. */
const signOut = () =>
  mocks.requireStaff.mockRejectedValueOnce(new Error("NEXT_REDIRECT /login"));

const { default: Page, generateMetadata } =
  await import("@/app/(staff)/dashboard/catalog/therapies/[slug]/edit/page");

const propsFor = (slug: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});

describe("/dashboard/catalog/therapies/[slug]/edit route", () => {
  it("requires a staff session", async () => {
    signOut();
    await expect(Page(propsFor("grounding-session"))).rejects.toThrow(
      "NEXT_REDIRECT /login",
    );
  });

  it("starts the form from the saved entry, with save and delete actions", async () => {
    const element = await Page(propsFor("grounding-session"));

    expect(element.props.title).toBe("Edit Grounding Session");
    expect(element.props.initialValues).toMatchObject({
      name: "Grounding Session",
      durationMinutes: "30",
    });
    expect(element.props.saveAction).toBeTypeOf("function");
    expect(element.props.deleteAction).toBeTypeOf("function");
  });

  it("keeps the page out of search engines", async () => {
    expect(await generateMetadata(propsFor("grounding-session"))).toEqual({
      title: "Edit Grounding Session",
      robots: { index: false },
    });
  });

  it("calls notFound() for an unknown slug", async () => {
    await expect(Page(propsFor("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
