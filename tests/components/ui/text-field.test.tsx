import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextArea, TextField } from "@/components/ui";

describe("TextField", () => {
  it("adds a caller's className to the control's own classes", () => {
    render(<TextField name="length" label="Length" className="sm:max-w-40" />);

    const input = screen.getByLabelText("Length");
    // Keeps the 44px tap target, border, and width; adds the caller's class.
    expect(input).toHaveClass("min-h-11", "ring-1", "w-full", "sm:max-w-40");
  });

  it("describes the control with its hint, and its error when it has one", () => {
    const { rerender } = render(
      <TextField name="length" label="Length" hint="15–240 minutes." />,
    );
    expect(screen.getByLabelText("Length")).toHaveAccessibleDescription(
      "15–240 minutes.",
    );

    rerender(
      <TextField
        name="length"
        label="Length"
        hint="15–240 minutes."
        error="Too long."
      />,
    );
    const input = screen.getByLabelText("Length");
    expect(input).toHaveAccessibleDescription("15–240 minutes. Too long.");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("has no description without a hint or error", () => {
    render(<TextField name="name" label="Name" />);

    expect(screen.getByLabelText("Name")).not.toHaveAttribute(
      "aria-describedby",
    );
  });
});

describe("TextArea", () => {
  it("wires its label, hint, and classes the same way", () => {
    render(
      <TextArea
        name="description"
        label="Description"
        hint="Shown on its page."
        className="font-mono"
      />,
    );

    const box = screen.getByLabelText("Description");
    expect(box.tagName).toBe("TEXTAREA");
    expect(box).toHaveClass("w-full", "py-2", "font-mono");
    expect(box).toHaveAccessibleDescription("Shown on its page.");
  });
});
