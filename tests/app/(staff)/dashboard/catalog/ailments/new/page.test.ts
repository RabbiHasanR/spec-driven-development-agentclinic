// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Db } from "@/lib/db/connection";
import { createTestDb } from "../../../../../../helpers/db";

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

const { default: Page } =
  await import("@/app/(staff)/dashboard/catalog/ailments/new/page");

describe("/dashboard/catalog/ailments/new route", () => {
  it("requires a staff session", async () => {
    signOut();
    await expect(Page()).rejects.toThrow("NEXT_REDIRECT /login");
  });

  it("starts an empty form with every therapy to pick from", async () => {
    const element = await Page();

    expect(element.props.initialValues.name).toBe("");
    expect(element.props.therapies).toHaveLength(8);
    expect(element.props.deleteAction).toBeUndefined();
  });
});
