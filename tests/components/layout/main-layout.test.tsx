import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MainLayout } from "@/components/layout";

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
});
