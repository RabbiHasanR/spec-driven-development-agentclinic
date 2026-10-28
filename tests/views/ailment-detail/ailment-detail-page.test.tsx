import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AilmentDetailPage } from "@/views/ailment-detail/ailment-detail-page";
import { AILMENT } from "../../helpers/fixtures";

describe("Ailment detail page", () => {
  it("renders the ailment and its therapy cards", () => {
    render(<AilmentDetailPage ailment={AILMENT} />);

    expect(
      screen.getByRole("heading", { level: 1, name: AILMENT.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(AILMENT.description)).toBeInTheDocument();

    const therapies = screen.getByRole("region", { name: "Therapies" });
    const card = within(therapies).getByRole("article");
    expect(card).toHaveTextContent("Grounding Session");
    expect(card).toHaveTextContent("Reconnect with your sources.");
    expect(card).toHaveTextContent("30 min");
  });

  it("shows an empty state when the ailment has no therapies", () => {
    render(<AilmentDetailPage ailment={{ ...AILMENT, therapies: [] }} />);

    expect(
      screen.getByText("No therapies are listed for this ailment yet."),
    ).toBeInTheDocument();
  });

  it("links back to the ailments list", () => {
    render(<AilmentDetailPage ailment={AILMENT} />);

    expect(
      screen.getByRole("link", { name: "← All ailments" }),
    ).toHaveAttribute("href", "/ailments");
  });
});
