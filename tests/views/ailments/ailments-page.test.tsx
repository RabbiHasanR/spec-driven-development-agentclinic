import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { listAilments } from "@/lib/db/ailments";
import { AilmentsPage } from "@/views/ailments/ailments-page";
import { createTestDb } from "../../helpers/db";

describe("Ailments page", () => {
  it("renders one card per ailment, each linking to its detail page", () => {
    const ailments = listAilments(createTestDb());
    render(<AilmentsPage ailments={ailments} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Ailments" }),
    ).toBeInTheDocument();
    const links = within(screen.getByRole("list")).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      ailments.map((ailment) => `/ailments/${ailment.slug}`),
    );
    expect(links[0]).toHaveTextContent(ailments[0].name);
  });

  it("shows an empty state when there are no ailments", () => {
    render(<AilmentsPage ailments={[]} />);

    expect(screen.getByText("No ailments are listed yet.")).toBeInTheDocument();
  });
});
