import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DeleteForm } from "@/components/catalog-admin";

describe("DeleteForm", () => {
  it("hides the delete button behind a confirm step", () => {
    const { container } = render(
      <DeleteForm
        action={vi.fn()}
        label="Delete therapy"
        consequence="Agents can't book it any more."
      />,
    );

    const details = container.querySelector("details")!;
    expect(details).not.toHaveAttribute("open");
    expect(details).toHaveTextContent("Agents can't book it any more.");
    expect(details).toContainElement(
      screen.getByRole("button", { name: "Yes, delete therapy", hidden: true }),
    );
  });

  it("shows why a delete was refused", async () => {
    const message = "This therapy has bookings, so it can't be deleted.";
    const { container } = render(
      <DeleteForm
        action={vi.fn(async () => ({ message }))}
        label="Delete therapy"
        consequence="…"
      />,
    );
    container.querySelector("details")!.open = true;

    fireEvent.click(
      screen.getByRole("button", { name: "Yes, delete therapy" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
  });
});
