import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OverviewStats } from "@/components/dashboard";

const valueOf = (label: string) =>
  screen.getByText(label).nextElementSibling?.textContent;

describe("OverviewStats", () => {
  it("shows today's, upcoming, and busiest-therapy figures", () => {
    render(
      <OverviewStats
        overview={{
          today: 2,
          upcoming: 5,
          busiestTherapy: { name: "Grounding Session", count: 3 },
        }}
      />,
    );

    expect(valueOf("Today")).toBe("2");
    expect(valueOf("Upcoming")).toBe("5");
    expect(valueOf("Busiest therapy")).toBe("Grounding Session");
    expect(screen.getByText("3 upcoming")).toBeInTheDocument();
  });

  it("shows a dash when there's no busiest therapy", () => {
    render(
      <OverviewStats
        overview={{ today: 0, upcoming: 0, busiestTherapy: null }}
      />,
    );

    expect(valueOf("Busiest therapy")).toBe("—");
  });
});
