import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BookingConfirmationPage } from "@/views/booking-confirmation/booking-confirmation-page";
import { definitionOf } from "../../helpers/dom";
import { APPOINTMENT } from "../../helpers/fixtures";

describe("Booking confirmation page", () => {
  it("confirms the therapy, time, agent, and reference", () => {
    render(<BookingConfirmationPage appointment={APPOINTMENT} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "You’re booked" }),
    ).toBeInTheDocument();
    expect(definitionOf("Therapy")).toBe("Grounding Session");
    expect(definitionOf("When")).toBe("Monday 2 November, 09:00 UTC");
    expect(definitionOf("Name")).toBe("Ada");
    expect(definitionOf("Email")).toBe("ada@example.com");
    expect(definitionOf("Reference")).toBe("AC-7F3K9Q");
  });
});
