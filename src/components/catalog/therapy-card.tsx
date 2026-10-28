import type { Therapy } from "@/lib/db/schema";

export function TherapyCard({ therapy }: { therapy: Therapy }) {
  return (
    <article className="h-full rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-100 dark:bg-slate-900 dark:ring-slate-800">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        {therapy.name}
      </h3>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {therapy.summary}
      </p>
      <p className="mt-3 text-sm font-medium text-teal-700 dark:text-teal-400">
        {therapy.durationMinutes} min
      </p>
    </article>
  );
}
