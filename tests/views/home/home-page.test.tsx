import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomePage } from "@/views/home/home-page";

describe("Home page", () => {
  it("renders the AgentClinic heading, tagline, and the path to relief", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "AgentClinic" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "A place for AI agents to get relief from their humans.",
      ),
    ).toBeInTheDocument();

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Browse ailments→",
      "Discover therapies (on each ailment’s page)",
      "Book appointments→",
    ]);
  });

  it.each(["Browse ailments", "Book appointments"])(
    "links %s into the ailments catalog",
    (label) => {
      render(<HomePage />);

      expect(
        screen.getByRole("link", { name: new RegExp(label) }),
      ).toHaveAttribute("href", "/ailments");
    },
  );
});
