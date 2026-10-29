import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffCatalogPage } from "@/views/staff-catalog/staff-catalog-page";
import { AILMENTS, THERAPIES } from "../../helpers/fixtures";

describe("Staff catalog page", () => {
  it("lists ailments and therapies with edit links", () => {
    render(<StaffCatalogPage ailments={AILMENTS} therapies={THERAPIES} />);

    const ailments = screen.getByRole("list", { name: "Ailments" });
    expect(within(ailments).getAllByRole("listitem")).toHaveLength(
      AILMENTS.length,
    );
    expect(
      screen.getByRole("link", { name: `Edit ${AILMENTS[0].name}` }),
    ).toHaveAttribute(
      "href",
      `/dashboard/catalog/ailments/${AILMENTS[0].slug}/edit`,
    );
    expect(
      screen.getByRole("link", { name: `Edit ${THERAPIES[1].name}` }),
    ).toHaveAttribute(
      "href",
      `/dashboard/catalog/therapies/${THERAPIES[1].slug}/edit`,
    );
    expect(
      screen.getByText(
        `${THERAPIES[1].durationMinutes} min · ${THERAPIES[1].summary}`,
      ),
    ).toBeInTheDocument();
  });

  it("links to the add forms", () => {
    render(<StaffCatalogPage ailments={[]} therapies={[]} />);

    expect(
      screen.getByRole("link", { name: /Add an ailment/ }),
    ).toHaveAttribute("href", "/dashboard/catalog/ailments/new");
    expect(screen.getByRole("link", { name: /Add a therapy/ })).toHaveAttribute(
      "href",
      "/dashboard/catalog/therapies/new",
    );
    expect(screen.getAllByText("None yet.")).toHaveLength(2);
  });
});
