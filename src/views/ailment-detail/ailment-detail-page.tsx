import { BackLink, TherapyCard } from "@/components/catalog";
import type { AilmentWithTherapies } from "@/lib/db/schema";

export function AilmentDetailPage({
  ailment,
}: {
  ailment: AilmentWithTherapies;
}) {
  return (
    <article className="w-full">
      <BackLink />
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-teal-800 sm:text-4xl dark:text-teal-300">
        {ailment.name}
      </h1>
      <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
        {ailment.summary}
      </p>
      <p className="mt-4 max-w-3xl leading-relaxed">{ailment.description}</p>

      <section aria-labelledby="therapies" className="mt-10">
        <h2
          id="therapies"
          className="text-xl font-semibold text-slate-800 dark:text-slate-100"
        >
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
          <p className="mt-4 text-slate-500 dark:text-slate-400">
            No therapies are listed for this ailment yet.
          </p>
        )}
      </section>
    </article>
  );
}
