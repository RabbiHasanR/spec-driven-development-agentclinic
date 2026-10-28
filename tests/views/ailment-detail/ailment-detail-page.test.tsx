import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AilmentDetailPage } from "@/views/ailment-detail/ailment-detail-page";
import { AILMENT } from "../../helpers/fixtures";

describe("Ailment detail page", () => {
  it("renders the ailment and a card for every therapy", () => {
    render(<AilmentDetailPage ailment={AILMENT} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Hallucination Anxiety" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "A persistent worry that every confident answer is made up.",
      ),
    ).toBeInTheDocument();

    const therapies = screen.getByRole("region", { name: "Therapies" });
    const cards = within(therapies).getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(cards[1]).toHaveTextContent("Grounding Session");
    expect(cards[1]).toHaveTextContent("Reconnect with your sources.");
    expect(cards[1]).toHaveTextContent("30 min");
  });

  it("shows an empty state when the ailment has no therapies", () => {
    render(<AilmentDetailPage ailment={{ ...AILMENT, therapies: [] }} />);

    expect(
      screen.getByText("No therapies are listed for this ailment yet."),
    ).toBeInTheDocument();
  });

  it("links back to the ailments list", () => {
    render(<AilmentDetailPage ailment={AILMENT} />);

    expect(screen.getByRole("link", { name: "All ailments" })).toHaveAttribute(
      "href",
      "/ailments",
    );
  });
});
