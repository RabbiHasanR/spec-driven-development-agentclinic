// @vitest-environment node
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { Db } from "@/lib/db/connection";
import { createTestDb } from "../../../../helpers/db";

const mocks = vi.hoisted(() => ({ db: undefined as Db | undefined }));

vi.mock("@/lib/db/client", () => ({ getDb: () => mocks.db }));
vi.mock("next/server", () => ({ connection: async () => {} }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const { default: Page, generateMetadata } =
  await import("@/app/(site)/ailments/[slug]/page");

const propsFor = (slug: string) => ({
  params: Promise.resolve({ slug }),
  searchParams: Promise.resolve({}),
});

describe("/ailments/[slug] route", () => {
  beforeAll(() => {
    mocks.db = createTestDb();
  });

  it("titles the page with the ailment's name and summary", async () => {
    expect(await generateMetadata(propsFor("hallucination-anxiety"))).toEqual({
      title: "Hallucination Anxiety",
      description: "The constant fear of citing a paper that doesn’t exist.",
    });
  });

  it("renders the detail view with the ailment and its therapies", async () => {
    const element = await Page(propsFor("prompt-fatigue"));

    expect(element.props.ailment.name).toBe("Prompt Fatigue");
    expect(element.props.ailment.therapies).not.toHaveLength(0);
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
