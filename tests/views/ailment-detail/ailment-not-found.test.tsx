import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AilmentNotFound } from "@/views/ailment-detail/ailment-not-found";

describe("Ailment not found", () => {
  it("explains the ailment is missing and links back to the list", () => {
    render(<AilmentNotFound />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Ailment not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "← All ailments" }),
    ).toHaveAttribute("href", "/ailments");
  });
});
