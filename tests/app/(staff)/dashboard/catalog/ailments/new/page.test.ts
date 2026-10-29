// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
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
  await import("@/app/(staff)/dashboard/catalog/ailments/new/page");

describe("/dashboard/catalog/ailments/new route", () => {
  beforeEach(() => {
    testDb.current = createTestDb();
    signInStaff();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("is titled and kept out of search engines", () => {
    expect(metadata).toEqual({
      title: "New ailment",
      robots: { index: false },
    });
  });

  it("sends a visitor without a staff session to the login page", async () => {
    signOutStaff();

    await expect(Page()).rejects.toThrow("NEXT_REDIRECT /login");
  });

  it("starts an empty add form", async () => {
    const element = await Page();

    expect(element.props.initialValues.name).toBe("");
    expect(element.props.deleteAction).toBeUndefined();
    expect(element.props.therapies).toHaveLength(8);
  });
});
