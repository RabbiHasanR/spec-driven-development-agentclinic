import Link from "next/link";
import type { Ailment } from "@/lib/db/schema";

/** Ailment summary card; the whole card links to the ailment's detail page. */
export function AilmentCard({ ailment }: { ailment: Ailment }) {
  return (
    <Link
      href={`/ailments/${ailment.slug}`}
      className="block h-full rounded-xl bg-white p-5 shadow-sm ring-1 ring-teal-100 transition hover:ring-teal-300 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-teal-700"
    >
      <h2 className="text-lg font-semibold text-teal-800 dark:text-teal-300">
        {ailment.name}
      </h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {ailment.summary}
      </p>
    </Link>
  );
}
