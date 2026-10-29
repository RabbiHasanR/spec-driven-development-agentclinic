import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StaffBookingPage } from "@/views/staff-booking/staff-booking-page";
import { definitionOf } from "../../helpers/dom";
import { APPOINTMENT } from "../../helpers/fixtures";

describe("Staff booking page", () => {
  it("shows the booking's details and status", () => {
    render(
      <StaffBookingPage
        appointment={APPOINTMENT}
        allowed={["cancelled"]}
        action={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Booking AC-7F3K9Q" }),
    ).toBeInTheDocument();
    expect(definitionOf("Status")).toBe("Booked");
    expect(definitionOf("When")).toBe("Monday 2 November, 09:00 UTC");
    expect(definitionOf("Email")).toBe("ada@example.com");
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });

  it("offers the allowed changes", () => {
    render(
      <StaffBookingPage
        appointment={APPOINTMENT}
        allowed={["attended", "no_show"]}
        action={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Mark attended" }),
    ).toBeInTheDocument();
  });

  it("says a final booking can't change", () => {
    render(
      <StaffBookingPage
        appointment={{ ...APPOINTMENT, status: "no_show" }}
        allowed={[]}
        action={vi.fn()}
      />,
    );

    expect(definitionOf("Status")).toBe("No-show");
    expect(
      screen.getByText("This booking is no-show; no further changes."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
