import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BookingConfirmationPage } from "@/views/booking-confirmation/booking-confirmation-page";
import { APPOINTMENT } from "../../helpers/fixtures";

describe("Booking confirmation page", () => {
  it("confirms the therapy, time, agent, and reference", () => {
    render(<BookingConfirmationPage appointment={APPOINTMENT} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "You’re booked" }),
    ).toBeInTheDocument();
    const detail = (term: string) =>
      screen.getByText(term).nextElementSibling?.textContent;
    expect(detail("Therapy")).toBe("Grounding Session");
    expect(detail("When")).toBe("Monday 2 November, 09:00 UTC");
    expect(detail("Name")).toBe("Ada");
    expect(detail("Email")).toBe("ada@example.com");
    expect(detail("Reference")).toBe("AC-7F3K9Q");
  });
});
