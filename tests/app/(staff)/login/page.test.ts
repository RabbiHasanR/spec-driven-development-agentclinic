// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ signedIn: false }));

vi.mock("@/lib/auth/actions", () => ({ signIn: vi.fn() }));
vi.mock("@/lib/auth/staff", () => ({
  isStaffSignedIn: async () => mocks.signedIn,
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
}));

const { default: Page, metadata } = await import("@/app/(staff)/login/page");

const propsFor = (searchParams: Record<string, string | string[]>) => ({
  params: Promise.resolve({}),
  searchParams: Promise.resolve(searchParams),
});

describe("/login route", () => {
  beforeEach(() => {
    mocks.signedIn = false;
  });

  it("keeps the page out of search engines", () => {
    expect(metadata).toEqual({
      title: "Staff sign in",
      robots: { index: false },
    });
  });

  it("passes the page to return to into the form", async () => {
    const element = await Page(propsFor({ next: "/dashboard/catalog" }));

    expect(element.props.next).toBe("/dashboard/catalog");
  });

  it("ignores a repeated next parameter", async () => {
    const element = await Page(propsFor({ next: ["/a", "/b"] }));

    expect(element.props.next).toBeUndefined();
  });

  it("skips the form for staff who are already signed in", async () => {
    mocks.signedIn = true;

    await expect(
      Page(propsFor({ next: "https://evil.example" })),
    ).rejects.toThrow("NEXT_REDIRECT /dashboard");
  });
});
