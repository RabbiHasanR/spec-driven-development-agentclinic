import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorPage } from "@/views/error/error-page";

describe("Error page", () => {
  it("explains the error and retries on click", () => {
    const onRetry = vi.fn();
    render(<ErrorPage onRetry={onRetry} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Something went wrong" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
