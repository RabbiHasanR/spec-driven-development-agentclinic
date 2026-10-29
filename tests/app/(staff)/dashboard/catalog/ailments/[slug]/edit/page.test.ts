// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { getAilmentBySlug } from "@/lib/db/ailments";
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
  await import("@/app/(staff)/dashboard/catalog/ailments/[slug]/edit/page");

const propsFor = (slug: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});

describe("/dashboard/catalog/ailments/[slug]/edit route", () => {
  beforeEach(() => {
    testDb.current = createTestDb();
    signInStaff();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("sends a visitor without a staff session to the login page", async () => {
    signOutStaff();

    await expect(Page(propsFor("prompt-fatigue"))).rejects.toThrow(
      "NEXT_REDIRECT /login",
    );
  });

  it("is titled after the ailment and kept out of search engines", async () => {
    expect(await generateMetadata(propsFor("prompt-fatigue"))).toEqual({
      title: "Edit Prompt Fatigue",
      robots: { index: false },
    });
  });

  it("starts from the saved ailment, with its linked therapies checked", async () => {
    const element = await Page(propsFor("prompt-fatigue"));
    const ailment = getAilmentBySlug(testDb.current!, "prompt-fatigue")!;

    expect(element.props.title).toBe("Edit Prompt Fatigue");
    expect(element.props.initialValues).toEqual({
      name: ailment.name,
      summary: ailment.summary,
      description: ailment.description,
      therapyIds: ailment.therapies.map(({ id }) => String(id)),
    });
  });

  it("binds delete to this ailment", async () => {
    const element = await Page(propsFor("prompt-fatigue"));

    await expect(
      element.props.deleteAction({}, new FormData()),
    ).rejects.toThrow("NEXT_REDIRECT /dashboard/catalog");
    expect(getAilmentBySlug(testDb.current!, "prompt-fatigue")).toBeUndefined();
  });

  it("calls notFound() for an unknown slug", async () => {
    await expect(Page(propsFor("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
