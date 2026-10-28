import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookTherapyPage } from "@/views/book-therapy/book-therapy-page";
import { SLOTS, THERAPIES } from "../../helpers/fixtures";

const THERAPY = THERAPIES[1];

describe("Book therapy page", () => {
  it("shows the therapy and the booking form with its open slots", () => {
    render(
      <BookTherapyPage therapy={THERAPY} slots={SLOTS} action={vi.fn()} />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Book Grounding Session" }),
    ).toBeInTheDocument();
    expect(screen.getByText("30 min session")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(SLOTS.length);
    expect(
      screen.getByRole("button", { name: "Book appointment" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state instead of the form when no slots are open", () => {
    render(<BookTherapyPage therapy={THERAPY} slots={[]} action={vi.fn()} />);

    expect(
      screen.getByText(/No open times in the next 14 days/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("links back to the catalog", () => {
    render(
      <BookTherapyPage therapy={THERAPY} slots={SLOTS} action={vi.fn()} />,
    );

    expect(
      screen.getByRole("link", { name: "Browse ailments" }),
    ).toHaveAttribute("href", "/ailments");
  });
});
