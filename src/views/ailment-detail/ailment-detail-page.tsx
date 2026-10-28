import { TherapyCard } from "@/components/catalog";
import { BackLink, PageHeader, Section } from "@/components/ui";
import type { AilmentWithTherapies } from "@/lib/db/types";
import { ROUTES } from "@/lib/routes";

/** One ailment: its description and the therapies that treat it. */
export function AilmentDetailPage({
  ailment,
}: {
  ailment: AilmentWithTherapies;
}) {
  return (
    <div className="w-full">
      <BackLink href={ROUTES.ailments} label="All ailments" />
      <article className="mt-2">
        <PageHeader title={ailment.name} lead={ailment.summary} />
        <p className="mt-4 max-w-3xl leading-relaxed">{ailment.description}</p>

        <Section id="therapies" title="Therapies">
          {ailment.therapies.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {ailment.therapies.map((therapy) => (
                <li key={therapy.id}>
                  <TherapyCard therapy={therapy} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">
              No therapies are listed for this ailment yet.
            </p>
          )}
        </Section>
      </article>
    </div>
  );
}
