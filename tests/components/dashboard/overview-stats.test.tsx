import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OverviewStats } from "@/components/dashboard";
import { definitionOf } from "../../helpers/dom";

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

    expect(definitionOf("Today")).toBe("2");
    expect(definitionOf("Upcoming")).toBe("5");
    expect(definitionOf("Busiest therapy")).toBe("Grounding Session");
    expect(screen.getByText("3 upcoming")).toBeInTheDocument();
  });

  it("shows a dash when there's no busiest therapy", () => {
    render(
      <OverviewStats
        overview={{ today: 0, upcoming: 0, busiestTherapy: null }}
      />,
    );

    expect(definitionOf("Busiest therapy")).toBe("—");
  });

  it("says there's no single leader when therapies tie", () => {
    render(
      <OverviewStats
        overview={{ today: 0, upcoming: 2, busiestTherapy: null }}
      />,
    );

    expect(definitionOf("Busiest therapy")).toBe("—");
    expect(screen.getByText("No single leader yet")).toBeInTheDocument();
  });
});
