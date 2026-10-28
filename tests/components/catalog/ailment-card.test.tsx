import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AilmentCard } from "@/components/catalog";
import { AILMENTS } from "../../helpers/fixtures";

describe("AilmentCard", () => {
  it("links the whole card, with name and summary, to the detail page", () => {
    const [ailment] = AILMENTS;
    render(<AilmentCard ailment={ailment} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/ailments/hallucination-anxiety");
    expect(
      screen.getByRole("heading", { name: "Hallucination Anxiety" }),
    ).toBeInTheDocument();
    expect(link).toHaveTextContent("Fear of citing papers that don’t exist.");
  });
});
