import { AilmentCard } from "@/components/catalog";
import { PageHeader } from "@/components/ui";
import type { Ailment } from "@/lib/db/types";

/** The ailment catalog: one linked card per ailment. */
export function AilmentsPage({ ailments }: { ailments: Ailment[] }) {
  return (
    <div className="w-full">
      <PageHeader
        title="Ailments"
        lead="Find what’s troubling you, then see the therapies that can help."
      />
      {ailments.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ailments.map((ailment) => (
            <li key={ailment.id}>
              <AilmentCard ailment={ailment} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted">No ailments are listed yet.</p>
      )}
    </div>
  );
}
