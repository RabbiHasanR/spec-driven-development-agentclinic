import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NavLink } from "@/components/layout/nav-link";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

describe("NavLink", () => {
  it("isn't marked current on another page", () => {
    render(<NavLink href="/ailments" label="Ailments" />);

    expect(screen.getByRole("link", { name: "Ailments" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
