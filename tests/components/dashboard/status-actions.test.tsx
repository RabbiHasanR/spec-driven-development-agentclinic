import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusActions } from "@/components/dashboard";
import type { StatusAction } from "@/lib/booking/form-state";

describe("StatusActions", () => {
  it("submits the chosen status", async () => {
    const action = vi.fn<StatusAction>(async () => ({}));
    render(<StatusActions action={action} allowed={["attended", "no_show"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Mark no-show" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect(action.mock.calls[0][1].get("status")).toBe("no_show");
  });

  it("offers only the allowed changes", () => {
    render(
      <StatusActions action={vi.fn()} allowed={["attended", "no_show"]} />,
    );

    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Mark attended",
      "Mark no-show",
    ]);
    expect(screen.queryByText(/Cancel booking/)).not.toBeInTheDocument();
  });

  it("asks to confirm before cancelling", () => {
    const { container } = render(
      <StatusActions action={vi.fn()} allowed={["cancelled"]} />,
    );

    const details = container.querySelector("details")!;
    expect(details).not.toHaveAttribute("open");
    expect(details.querySelector("summary")).toHaveTextContent(
      "Cancel booking…",
    );
    // The submit button lives inside the closed disclosure.
    const confirm = screen.getByRole("button", {
      name: "Yes, cancel this booking",
      hidden: true,
    });
    expect(details).toContainElement(confirm);
    expect(confirm).toHaveAttribute("value", "cancelled");
  });

  it("shows why a change couldn't be made", async () => {
    const message = "That change isn't possible any more.";
    render(
      <StatusActions
        action={vi.fn(async () => ({ message }))}
        allowed={["attended", "no_show"]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Mark attended" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(message);
  });
});
