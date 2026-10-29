import { CatalogEditor, TherapyForm } from "@/components/catalog-admin";
import type { CatalogSaveAction, DeleteAction } from "@/lib/catalog/form-state";
import type { TherapyFormValues } from "@/lib/catalog/validate";

/** Add a therapy (no `deleteAction`) or edit one (with a delete option). */
export function TherapyEditorPage({
  title,
  initialValues,
  saveAction,
  deleteAction,
}: {
  title: string;
  initialValues: TherapyFormValues;
  saveAction: CatalogSaveAction<TherapyFormValues>;
  deleteAction?: DeleteAction;
}) {
  return (
    <CatalogEditor
      kind="therapy"
      title={title}
      lead="Changing the length affects new bookings only; booked sessions keep their times."
      renderForm={(submitLabel) => (
        <TherapyForm
          action={saveAction}
          initialValues={initialValues}
          submitLabel={submitLabel}
        />
      )}
      deleteAction={deleteAction}
      deleteConsequence="Agents will no longer be able to book it. Therapies with bookings, or that are an ailment’s only therapy, can’t be deleted."
    />
  );
}
