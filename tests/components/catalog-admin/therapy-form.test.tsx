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

  it("shows errors next to their fields, keeps the values, and focuses the first", async () => {
    const lengthError = "Use 15–240 minutes, in steps of 15.";
    render(
      <TherapyForm
        action={vi.fn(async () => ({
          values: {
            name: "Rate Limit Rest",
            summary: "",
            durationMinutes: "50",
          },
          errors: { summary: "Enter a summary.", durationMinutes: lengthError },
        }))}
        // Valid as far as the browser can tell (required, step), so it submits;
        // the mocked server answers with errors.
        initialValues={{
          name: "Rate Limit Rest",
          summary: "x",
          durationMinutes: "45",
        }}
        submitLabel="Add therapy"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add therapy" }));

    const summary = await screen.findByLabelText("Summary");
    await vi.waitFor(() => expect(summary).toHaveFocus());
    expect(screen.getByLabelText("Name")).toHaveValue("Rate Limit Rest");
    const length = screen.getByLabelText("Length (minutes)");
    expect(length).toHaveValue(50);
    expect(length).toHaveAttribute("aria-invalid", "true");
    // The hint and the error are both read out.
    expect(length).toHaveAccessibleDescription(
      `15–240, in steps of 15. ${lengthError}`,
    );
    // Styled like every other field, despite its narrower width.
    expect(length).toHaveClass("min-h-11", "ring-1", "sm:max-w-40");
  });
});
