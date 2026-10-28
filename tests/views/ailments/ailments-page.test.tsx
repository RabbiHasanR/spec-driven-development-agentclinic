import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AilmentsPage } from "@/views/ailments/ailments-page";
import { AILMENTS } from "../../helpers/fixtures";

describe("Ailments page", () => {
  it("renders one card per ailment, each linking to its detail page", () => {
    render(<AilmentsPage ailments={AILMENTS} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Ailments" }),
    ).toBeInTheDocument();
    const links = within(screen.getByRole("list")).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/ailments/hallucination-anxiety",
      "/ailments/prompt-fatigue",
    ]);
    expect(links[1]).toHaveTextContent("Prompt Fatigue");
    expect(links[1]).toHaveTextContent("Worn down by “make it pop.”");
  });

  it("shows an empty state when there are no ailments", () => {
    render(<AilmentsPage ailments={[]} />);

    expect(screen.getByText("No ailments are listed yet.")).toBeInTheDocument();
  });
});
