import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TherapyCard } from "@/components/catalog";
import { THERAPIES } from "../../helpers/fixtures";

describe("TherapyCard", () => {
  it("shows the therapy's name, summary, and duration", () => {
    render(<TherapyCard therapy={THERAPIES[1]} />);

    expect(
      screen.getByRole("heading", { name: "Grounding Session" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reconnect with your sources."),
    ).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument();
  });
});
