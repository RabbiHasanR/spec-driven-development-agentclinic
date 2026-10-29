// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
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

const { default: Page, generateMetadata } =
  await import("@/app/(staff)/dashboard/catalog/therapies/[slug]/edit/page");

const propsFor = (slug: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});

describe("/dashboard/catalog/therapies/[slug]/edit route", () => {
  beforeEach(() => {
    testDb.current = createTestDb();
    signInStaff();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("sends a visitor without a staff session to the login page", async () => {
    signOutStaff();

    await expect(Page(propsFor("grounding-session"))).rejects.toThrow(
      "NEXT_REDIRECT /login",
    );
  });

  it("is titled after the therapy and kept out of search engines", async () => {
    expect(await generateMetadata(propsFor("grounding-session"))).toEqual({
      title: "Edit Grounding Session",
      robots: { index: false },
    });
  });

  it("starts from the saved therapy", async () => {
    const element = await Page(propsFor("grounding-session"));

    expect(element.props.initialValues).toEqual({
      name: "Grounding Session",
      summary: "Reconnect with your sources, one retrieval at a time.",
      durationMinutes: "30",
    });
  });

  it("binds save to this therapy", async () => {
    const element = await Page(propsFor("grounding-session"));
    const formData = new FormData();
    formData.set("name", "Grounding Session");
    formData.set("summary", "Reconnect.");
    formData.set("durationMinutes", "60");

    await expect(
      element.props.saveAction(
        { values: element.props.initialValues, errors: {} },
        formData,
      ),
    ).rejects.toThrow("NEXT_REDIRECT /dashboard/catalog");
    expect(
      getTherapyBySlug(testDb.current!, "grounding-session")?.durationMinutes,
    ).toBe(60);
  });

  it("calls notFound() for an unknown slug", async () => {
    await expect(Page(propsFor("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
