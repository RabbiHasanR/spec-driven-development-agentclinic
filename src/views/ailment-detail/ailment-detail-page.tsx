import { TherapyCard } from "@/components/catalog";
import { BackLink, PageHeader } from "@/components/ui";
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

        <section aria-labelledby="therapies" className="mt-10">
          <h2 id="therapies" className="text-xl font-semibold">
            Therapies
          </h2>
          {ailment.therapies.length > 0 ? (
            <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {ailment.therapies.map((therapy) => (
                <li key={therapy.id}>
                  <TherapyCard therapy={therapy} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-muted">
              No therapies are listed for this ailment yet.
            </p>
          )}
        </section>
      </article>
    </div>
  );
}
