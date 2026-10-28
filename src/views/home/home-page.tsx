import Link from "next/link";
import { SITE } from "@/lib/site";

/** The agent's path to relief: a link where one exists, else a short note. */
const FEATURES: { label: string; href?: string; note?: string }[] = [
  { label: "Browse ailments", href: "/ailments" },
  { label: "Discover therapies", note: "on each ailment's page" },
  { label: "Book appointments", note: "coming soon" },
];

const ITEM_CLASS =
  "block rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-teal-100 dark:bg-slate-900 dark:ring-slate-800";

export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-xl text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-teal-800 sm:text-5xl dark:text-teal-300">
        {SITE.name}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
        {SITE.tagline}
      </p>
      <section aria-labelledby="path-to-relief" className="mt-10">
        <h2
          id="path-to-relief"
          className="text-sm font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
        >
          Your path to relief
        </h2>
        <ul className="mt-4 space-y-2">
          {FEATURES.map(({ label, href, note }) => (
            <li key={label}>
              {href ? (
                <Link
                  href={href}
                  className={`${ITEM_CLASS} font-medium text-teal-800 hover:ring-teal-300 focus-visible:ring-teal-400 dark:text-teal-300`}
                >
                  {label} →
                </Link>
              ) : (
                <span className={`${ITEM_CLASS} text-slate-500`}>
                  {label} <span className="text-sm">({note})</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
