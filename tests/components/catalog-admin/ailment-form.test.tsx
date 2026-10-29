import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AilmentForm } from "@/components/catalog-admin";
import {
  EMPTY_AILMENT_VALUES,
  type AilmentFormState,
} from "@/lib/catalog/form-state";
import type { CatalogSaveAction } from "@/lib/catalog/form-state";
import type { AilmentFormValues } from "@/lib/catalog/validate";
import { THERAPIES } from "../../helpers/fixtures";

const VALUES: AilmentFormValues = {
  name: "Prompt Fatigue",
  summary: "Worn down.",
  description: "Exhaustion.",
  therapyIds: [String(THERAPIES[1].id)],
};

function renderForm(
  action: CatalogSaveAction<AilmentFormValues> = vi.fn(),
  initialValues = VALUES,
) {
  render(
    <AilmentForm
      action={action}
      therapies={THERAPIES}
      initialValues={initialValues}
      submitLabel="Save changes"
    />,
  );
}

describe("AilmentForm", () => {
  it("starts from the given values, with linked therapies checked", () => {
    renderForm();

    expect(screen.getByLabelText("Name")).toHaveValue("Prompt Fatigue");
    expect(screen.getByLabelText("Description")).toHaveValue("Exhaustion.");
    const checked = screen
      .getAllByRole("checkbox")
      .filter((box) => (box as HTMLInputElement).checked);
    expect(checked).toHaveLength(1);
    expect(checked[0]).toHaveAccessibleName(
      expect.stringContaining(THERAPIES[1].name),
    );
  });

  it("offers every therapy as a checkbox", () => {
    renderForm(vi.fn(), EMPTY_AILMENT_VALUES);

    expect(
      screen.getByRole("group", { name: "Therapies that treat it" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(THERAPIES.length);
  });

  it("shows errors next to their fields, keeps the values, and focuses the first", async () => {
    const failed: AilmentFormState = {
      values: { ...VALUES, name: "Prompt fatigue", therapyIds: [] },
      errors: {
        name: "That name is already in use.",
        therapyIds: "Pick at least one therapy, so agents can book care.",
      },
    };
    renderForm(vi.fn(async () => failed));

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const name = await screen.findByLabelText("Name");
    await vi.waitFor(() => expect(name).toHaveFocus());
    expect(name).toHaveValue("Prompt fatigue");
    expect(name).toHaveAccessibleDescription("That name is already in use.");
    expect(screen.getAllByRole("checkbox")[0]).toHaveAccessibleDescription(
      failed.errors.therapyIds,
    );
    expect(
      screen
        .getAllByRole("checkbox")
        .some((box) => (box as HTMLInputElement).checked),
    ).toBe(false);
  });

  it("submits every checked therapy", async () => {
    const action = vi.fn<CatalogSaveAction<AilmentFormValues>>(
      async (state) => state,
    );
    renderForm(action);

    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await vi.waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect(action.mock.calls[0][1].getAll("therapyIds").sort()).toEqual(
      [String(THERAPIES[0].id), String(THERAPIES[1].id)].sort(),
    );
  });
});
