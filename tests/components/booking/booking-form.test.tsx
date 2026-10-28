import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BookingForm } from "@/components/booking";
import { groupSlotsByDay } from "@/lib/booking/format";
import type { BookingFormState } from "@/lib/booking/form-state";
import { SLOTS } from "../../helpers/fixtures";

const SLOT_DAYS = groupSlotsByDay(SLOTS);

const FAILED: BookingFormState = {
  values: {
    agentName: "Ada",
    agentEmail: "ada@",
    startsAt: SLOTS[1],
  },
  errors: { agentEmail: "Enter a valid email address, like ada@example.com." },
};

/** Fills in valid-looking details and submits, as an agent would. */
function submitFilledForm() {
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: "Ada" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "ada@example.com" },
  });
  fireEvent.click(screen.getByRole("radio", { name: "10:00" }));
  fireEvent.click(screen.getByRole("button", { name: "Book appointment" }));
}

describe("BookingForm", () => {
  it("offers each open slot as a radio, grouped by day", () => {
    render(<BookingForm action={vi.fn()} slotDays={SLOT_DAYS} />);

    expect(
      screen.getByRole("group", { name: "Monday 2 November" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(
      screen.getByRole("group", { name: "Pick a time (UTC)" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio", { name: "09:00" })[0]).toHaveAttribute(
      "value",
      SLOTS[0],
    );
  });

  it("uses mobile-friendly fields the browser can check before submitting", () => {
    render(<BookingForm action={vi.fn()} slotDays={SLOT_DAYS} />);

    expect(screen.getByLabelText("Your name")).toBeRequired();
    expect(screen.getAllByRole("radio")[0]).toBeRequired();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Your name")).toHaveAttribute(
      "autocomplete",
      "name",
    );
  });

  it("shows the action's errors next to their fields, with its values", async () => {
    const action = vi.fn(async () => FAILED);
    render(<BookingForm action={action} slotDays={SLOT_DAYS} />);

    submitFilledForm();

    const email = await screen.findByLabelText("Email");
    expect(
      await screen.findByText(FAILED.errors.agentEmail!),
    ).toBeInTheDocument();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription(FAILED.errors.agentEmail);
    expect(email).toHaveValue("ada@");
    expect(screen.getByLabelText("Your name")).toHaveValue("Ada");
    expect(screen.getByRole("radio", { name: "10:00" })).toBeChecked();
    expect(action).toHaveBeenCalledOnce();
  });

  it("shows a form-wide message as an alert", async () => {
    const action = vi.fn(async () => ({
      ...FAILED,
      errors: {},
      message: "This therapy is no longer available.",
    }));
    render(<BookingForm action={action} slotDays={SLOT_DAYS} />);

    submitFilledForm();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This therapy is no longer available.",
    );
  });
});
