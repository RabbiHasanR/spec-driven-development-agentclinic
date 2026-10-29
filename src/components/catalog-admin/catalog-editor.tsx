import type { ReactNode } from "react";
import { BackLink, PageHeader, Section } from "@/components/ui";
import { ROUTES } from "@/lib/routes";

/**
 * Page shell for adding or editing a catalog entry: back to the catalog, a
 * title, the form in a card, and (when editing) a separate danger zone.
 */
export function CatalogEditor({
  title,
  lead,
  form,
  danger,
}: {
  title: string;
  lead?: string;
  form: ReactNode;
  /** Delete controls; only when editing. */
  danger?: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <BackLink href={ROUTES.catalog} label="Catalog" />
      <div className="mt-2">
        <PageHeader title={title} lead={lead} />
      </div>
      <Section id="details" title="Details" className="mt-8 card p-5 sm:p-6">
        {form}
      </Section>
      {danger && (
        <Section id="danger" title="Danger zone" className="mt-8">
          {danger}
        </Section>
      )}
    </div>
  );
}
