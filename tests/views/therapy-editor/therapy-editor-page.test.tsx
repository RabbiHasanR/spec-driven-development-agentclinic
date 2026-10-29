import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_THERAPY_VALUES } from "@/lib/catalog/form-state";
import { TherapyEditorPage } from "@/views/therapy-editor/therapy-editor-page";

describe("Therapy editor page", () => {
  it("adds without a delete option", () => {
    render(
      <TherapyEditorPage
        title="New therapy"
        initialValues={EMPTY_THERAPY_VALUES}
        saveAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Add therapy" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Danger zone")).not.toBeInTheDocument();
  });

  it("edits with a delete option that explains the limits", () => {
    render(
      <TherapyEditorPage
        title="Edit Grounding Session"
        initialValues={EMPTY_THERAPY_VALUES}
        saveAction={vi.fn()}
        deleteAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Delete therapy…")).toBeInTheDocument();
    expect(
      screen.getByText(
        /with bookings, or that are an ailment’s only therapy|with bookings, or that are an ailment's only therapy/,
      ),
    ).toBeInTheDocument();
  });
});
