import { AilmentCard } from "@/components/catalog";
import type { Ailment } from "@/lib/db/schema";

export function AilmentsPage({ ailments }: { ailments: Ailment[] }) {
  return (
    <div className="w-full">
      <h1 className="text-3xl font-semibold tracking-tight text-teal-800 sm:text-4xl dark:text-teal-300">
        Ailments
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
        Find what’s troubling you, then see the therapies that can help.
      </p>
      {ailments.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ailments.map((ailment) => (
            <li key={ailment.id}>
              <AilmentCard ailment={ailment} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-slate-500 dark:text-slate-400">
          No ailments are listed yet.
        </p>
      )}
    </div>
  );
}
