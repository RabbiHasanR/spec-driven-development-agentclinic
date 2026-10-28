// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Db } from "@/lib/db/connection";
import { SEED_AILMENTS } from "@/lib/db/seed/data";
import { createTestDb } from "../../../helpers/db";

const mocks = vi.hoisted(() => ({ db: undefined as Db | undefined }));

vi.mock("@/lib/db/client", () => ({ getDb: () => mocks.db }));
vi.mock("next/server", () => ({ connection: async () => {} }));

const { default: Page, metadata } = await import("@/app/(site)/ailments/page");

describe("/ailments route", () => {
  beforeAll(() => {
    mocks.db = createTestDb();
  });

  it("titles the page Ailments", () => {
    expect(metadata.title).toBe("Ailments");
  });

  it("renders the list view with every ailment", async () => {
    const element = await Page();

    expect(element.props.ailments).toHaveLength(SEED_AILMENTS.length);
  });
});
