import { AilmentForm, CatalogEditor } from "@/components/catalog-admin";
import { ArrowLink } from "@/components/ui";
import type { CatalogSaveAction, DeleteAction } from "@/lib/catalog/form-state";
import type { AilmentFormValues } from "@/lib/catalog/validate";
import type { Therapy } from "@/lib/db/types";
import { ROUTES } from "@/lib/routes";

/**
 * Add an ailment (no `deleteAction`) or edit one (with a delete option).
 * Every ailment needs a therapy, so with none in the catalog it points staff
 * to add one first instead of showing a form that can't be submitted.
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
      kind="ailment"
      title={title}
      lead="Agents see the name and summary in the catalog, and the description on its page."
      renderForm={(submitLabel) =>
        therapies.length > 0 ? (
          <AilmentForm
            action={saveAction}
            therapies={therapies}
            initialValues={initialValues}
            submitLabel={submitLabel}
          />
        ) : (
          <div className="space-y-3">
            <p>
              Every ailment needs at least one therapy, so agents can book care.
              There are no therapies yet.
            </p>
            <ArrowLink href={ROUTES.newTherapy}>Add a therapy first</ArrowLink>
          </div>
        )
      }
      deleteAction={deleteAction}
      deleteConsequence="Agents will no longer find it. Its therapies and their bookings stay."
    />
  );
}
