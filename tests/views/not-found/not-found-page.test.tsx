import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotFoundPage } from "@/views/not-found/not-found-page";

describe("Not found page", () => {
  it("shows the message and links back to the parent page", () => {
    render(
      <NotFoundPage
        title="Ailment not found"
        message="We couldn’t find that ailment."
        backHref="/ailments"
        backLabel="All ailments"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Ailment not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("We couldn’t find that ailment."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All ailments" })).toHaveAttribute(
      "href",
      "/ailments",
    );
  });
});
