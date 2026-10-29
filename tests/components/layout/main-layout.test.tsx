import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MainLayout } from "@/components/layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/ailments/prompt-fatigue",
}));
// Reads the session cookie; covered in staff-nav.test.tsx.
vi.mock("@/components/layout/staff-nav", () => ({
  StaffNav: () => <li>Staff items</li>,
}));

describe("MainLayout", () => {
  it("renders header, main content, and footer landmarks", () => {
    render(
      <MainLayout>
        <p>Page content</p>
      </MainLayout>,
    );

    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const footer = screen.getByRole("contentinfo");

    expect(header.querySelector("a[href='/']")?.textContent).toBe(
      "AgentClinic",
    );
    expect(main).toHaveTextContent("Page content");
    expect(footer).toHaveTextContent("AgentClinic");
  });

  it("links to the ailments catalog from the main navigation", () => {
    render(
      <MainLayout>
        <p>Page content</p>
      </MainLayout>,
    );

    const nav = screen.getByRole("navigation", { name: "Main" });
    const link = within(nav).getByRole("link", { name: "Ailments" });
    expect(link).toHaveAttribute("href", "/ailments");
    // Marked current on an ailment's detail page too.
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("adds the staff items to the main navigation", () => {
    render(
      <MainLayout>
        <p>Page content</p>
      </MainLayout>,
    );

    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(nav).toHaveTextContent("Staff items");
    expect(
      within(nav).queryByRole("link", { name: "Dashboard" }),
    ).not.toBeInTheDocument();
  });
});
