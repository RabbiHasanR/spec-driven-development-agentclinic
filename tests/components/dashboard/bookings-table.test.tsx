import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BookingsTable } from "@/components/dashboard";
import { APPOINTMENT } from "../../helpers/fixtures";

const ROW = [
  "Monday 2 November, 09:00 UTC",
  "Grounding Session",
  "Ada",
  "ada@example.com",
  "Booked",
  "AC-7F3K9Q",
];

describe("BookingsTable", () => {
  it("shows each booking as a table row for wider screens", () => {
    render(<BookingsTable caption="Upcoming" appointments={[APPOINTMENT]} />);

    const table = screen.getByRole("table", { name: "Upcoming" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((th) => th.textContent),
    ).toEqual(["When", "Therapy", "Agent", "Email", "Status", "Reference"]);
    expect(
      within(table)
        .getAllByRole("cell")
        .map((td) => td.textContent),
    ).toEqual(ROW);
  });

  it("also shows each booking as a card for phones", () => {
    render(<BookingsTable caption="Upcoming" appointments={[APPOINTMENT]} />);

    const cards = within(
      screen.getByRole("list", { name: "Upcoming" }),
    ).getAllByRole("listitem");
    expect(cards).toHaveLength(1);
    for (const value of ROW) expect(cards[0]).toHaveTextContent(value);
  });

  it("links each booking to its staff page", () => {
    render(<BookingsTable caption="Upcoming" appointments={[APPOINTMENT]} />);

    // Once in the table, once in the phone cards.
    for (const link of screen.getAllByRole("link", {
      name: "Manage booking AC-7F3K9Q",
    })) {
      expect(link).toHaveAttribute("href", "/dashboard/bookings/AC-7F3K9Q");
    }
  });
});
