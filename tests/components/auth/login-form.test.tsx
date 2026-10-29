import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth";
import { INCORRECT_PASSWORD_MESSAGE } from "@/lib/auth/form-state";

function submit(password = "guess") {
  fireEvent.change(screen.getByLabelText("Staff password"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginForm", () => {
  it("asks for the password in a field password managers recognize", () => {
    render(<LoginForm action={vi.fn()} />);

    const password = screen.getByLabelText("Staff password");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(password).toBeRequired();
  });

  it("carries the page to return to", () => {
    const { container } = render(
      <LoginForm action={vi.fn()} next="/dashboard/catalog" />,
    );

    expect(container.querySelector("input[name='next']")).toHaveValue(
      "/dashboard/catalog",
    );
  });

  it("shows a wrong password next to the field and focuses it", async () => {
    const action = vi.fn(async () => ({
      errors: { password: INCORRECT_PASSWORD_MESSAGE },
    }));
    render(<LoginForm action={action} />);

    submit();

    const password = await screen.findByLabelText("Staff password");
    await vi.waitFor(() => expect(password).toHaveFocus());
    expect(password).toHaveAttribute("aria-invalid", "true");
    expect(password).toHaveAccessibleDescription(INCORRECT_PASSWORD_MESSAGE);
  });

  it("shows a form-wide message as an alert", async () => {
    const action = vi.fn(async () => ({
      errors: {},
      message: "Not set up yet.",
    }));
    render(<LoginForm action={action} />);

    submit();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Not set up yet.",
    );
  });
});
