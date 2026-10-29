import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ signedIn: false }));

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));
vi.mock("@/lib/auth/actions", () => ({ signOut: vi.fn() }));
vi.mock("@/lib/auth/staff", () => ({
  isStaffSignedIn: async () => mocks.signedIn,
}));

const { StaffNav, StaffNavItems } =
  await import("@/components/layout/staff-nav");

describe("StaffNav", () => {
  it("shows nothing to visitors who aren't signed in", async () => {
    mocks.signedIn = false;

    expect(await StaffNav()).toBeNull();
  });

  it("shows the staff items once signed in", async () => {
    mocks.signedIn = true;

    expect(await StaffNav()).toEqual(<StaffNavItems />);
  });
});

describe("StaffNavItems", () => {
  it("links to the dashboard and offers sign out", () => {
    render(
      <ul>
        <StaffNavItems />
      </ul>,
    );

    const dashboard = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboard).toHaveAttribute("href", "/dashboard");
    expect(dashboard).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});
