import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_AILMENT_VALUES } from "@/lib/catalog/form-state";
import { AilmentEditorPage } from "@/views/ailment-editor/ailment-editor-page";
import { THERAPIES } from "../../helpers/fixtures";

describe("Ailment editor page", () => {
  it("adds without a delete option", () => {
    render(
      <AilmentEditorPage
        title="New ailment"
        therapies={THERAPIES}
        initialValues={EMPTY_AILMENT_VALUES}
        saveAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "New ailment" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add ailment" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Danger zone")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Catalog/ })).toHaveAttribute(
      "href",
      "/dashboard/catalog",
    );
  });

  it("edits with a delete option", () => {
    render(
      <AilmentEditorPage
        title="Edit Prompt Fatigue"
        therapies={THERAPIES}
        initialValues={EMPTY_AILMENT_VALUES}
        saveAction={vi.fn()}
        deleteAction={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Save changes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Danger zone" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Delete ailment…")).toBeInTheDocument();
  });
});
