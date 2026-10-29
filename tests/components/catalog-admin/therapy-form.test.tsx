import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TherapyForm } from "@/components/catalog-admin";
import { EMPTY_THERAPY_VALUES } from "@/lib/catalog/form-state";

describe("TherapyForm", () => {
  it("asks for the length on the 15-minute grid with a number keypad", () => {
    render(
      <TherapyForm
        action={vi.fn()}
        initialValues={EMPTY_THERAPY_VALUES}
        submitLabel="Add therapy"
      />,
    );

    const length = screen.getByLabelText("Length (minutes)");
    expect(length).toHaveAttribute("type", "number");
    expect(length).toHaveAttribute("inputmode", "numeric");
    expect(length).toHaveAttribute("step", "15");
    expect(length).toHaveAttribute("min", "15");
    expect(length).toHaveAttribute("max", "240");
    expect(length).toBeRequired();
  });

  it("shows a whole-form message as an alert", async () => {
    render(
      <TherapyForm
        action={vi.fn(async () => ({
          values: EMPTY_THERAPY_VALUES,
          errors: {},
          message: "This therapy no longer exists.",
        }))}
        initialValues={{ name: "x", summary: "y", durationMinutes: "30" }}
        submitLabel="Save changes"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This therapy no longer exists.",
    );
  });
});
