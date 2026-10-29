import {
  AilmentForm,
  CatalogEditor,
  DeleteForm,
} from "@/components/catalog-admin";
import type { CatalogSaveAction, DeleteAction } from "@/lib/catalog/form-state";
import type { AilmentFormValues } from "@/lib/catalog/validate";
import type { Therapy } from "@/lib/db/types";

/**
 * Add an ailment (no `deleteAction`) or edit one (with a delete option).
 */
export function AilmentEditorPage({
  title,
  therapies,
  initialValues,
  saveAction,
  deleteAction,
}: {
  title: string;
  therapies: Therapy[];
  initialValues: AilmentFormValues;
  saveAction: CatalogSaveAction<AilmentFormValues>;
  deleteAction?: DeleteAction;
}) {
  return (
    <CatalogEditor
      title={title}
      lead="Agents see the name and summary in the catalog, and the description on its page."
      form={
        <AilmentForm
          action={saveAction}
          therapies={therapies}
          initialValues={initialValues}
          submitLabel={deleteAction ? "Save changes" : "Add ailment"}
        />
      }
      danger={
        deleteAction && (
          <DeleteForm
            action={deleteAction}
            label="Delete ailment"
            consequence="Agents will no longer find it. Its therapies and their bookings stay."
          />
        )
      }
    />
  );
}
