import type { ReactNode } from "react";
import { BackLink, PageHeader, Section } from "@/components/ui";
import type { DeleteAction } from "@/lib/catalog/form-state";
import { ROUTES } from "@/lib/routes";
import { DeleteForm } from "./delete-form";

/**
 * Page shell for adding or editing a catalog entry: back to the catalog, a
 * title, the form in a card, and, when editing, a separate danger zone with
 * the delete form. Passing `deleteAction` is what makes it an edit page.
 *
 * @param kind - What the entry is, for button labels ("Add therapy").
 * @param renderForm - Renders the form with the right submit label.
 * @param deleteConsequence - What deleting will do, in a sentence.
 */
export function CatalogEditor({
  kind,
  title,
  lead,
  renderForm,
  deleteAction,
  deleteConsequence,
}: {
  kind: "ailment" | "therapy";
  title: string;
  lead?: string;
  renderForm: (submitLabel: string) => ReactNode;
  deleteAction?: DeleteAction;
  deleteConsequence: string;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <BackLink href={ROUTES.catalog} label="Catalog" />
      <div className="mt-2">
        <PageHeader title={title} lead={lead} />
      </div>
      <Section id="details" title="Details" className="mt-8 card p-5 sm:p-6">
        {renderForm(deleteAction ? "Save changes" : `Add ${kind}`)}
      </Section>
      {deleteAction && (
        <Section id="danger" title="Danger zone" className="mt-8">
          <DeleteForm
            action={deleteAction}
            label={`Delete ${kind}`}
            consequence={deleteConsequence}
          />
        </Section>
      )}
    </div>
  );
}
