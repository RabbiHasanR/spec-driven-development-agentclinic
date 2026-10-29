import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardPage } from "@/views/dashboard/dashboard-page";
import { appointmentAt } from "../../helpers/fixtures";

const OVERVIEW = { today: 0, upcoming: 1, busiestTherapy: null };
const UPCOMING = appointmentAt("2026-11-02T09:00:00.000Z");

describe("Dashboard page", () => {
  it("shows the overview and the upcoming bookings", () => {
    render(
      <DashboardPage
        schedule={{ upcoming: [UPCOMING], past: [] }}
        overview={OVERVIEW}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Overview" }),
    ).toBeInTheDocument();
    const upcoming = screen.getByRole("region", { name: "Upcoming bookings" });
    expect(within(upcoming).getByRole("table")).toHaveTextContent(
      UPCOMING.reference,
    );
  });

  it("shows empty states when there are no bookings", () => {
    render(
      <DashboardPage
        schedule={{ upcoming: [], past: [] }}
        overview={{ ...OVERVIEW, upcoming: 0 }}
      />,
    );

    expect(screen.getByText("No upcoming bookings yet.")).toBeInTheDocument();
    expect(screen.getByText("No past bookings.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("links to the catalog, where staff manage ailments and therapies", () => {
    render(
      <DashboardPage
        schedule={{ upcoming: [], past: [] }}
        overview={OVERVIEW}
      />,
    );

    expect(
      screen.getByRole("link", { name: /Manage ailments and therapies/ }),
    ).toHaveAttribute("href", "/dashboard/catalog");
  });
});
