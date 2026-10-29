import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginPage } from "@/views/login/login-page";

describe("Login page", () => {
  it("shows the staff sign-in form", () => {
    render(<LoginPage action={vi.fn()} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Staff sign in" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Staff password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });
});
