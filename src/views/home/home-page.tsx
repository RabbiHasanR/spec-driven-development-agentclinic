import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { SITE } from "@/lib/site";

/** The agent's path to relief: a link where one exists, else a short note. */
const FEATURES: { label: string; href?: string; note?: string }[] = [
  { label: "Browse ailments", href: ROUTES.ailments },
  { label: "Discover therapies", note: "on each ailment’s page" },
  { label: "Book appointments", note: "coming soon" },
];

/** Landing page: site name, tagline, and the agent's path to relief. */
export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-xl text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-accent sm:text-5xl">
        {SITE.name}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft sm:text-xl">
        {SITE.tagline}
      </p>
      <section aria-labelledby="path-to-relief" className="mt-10">
        <h2
          id="path-to-relief"
          className="text-sm font-medium tracking-wide text-muted uppercase"
        >
          Your path to relief
        </h2>
        <ul className="mt-4 space-y-2">
          {FEATURES.map(({ label, href, note }) => (
            <li key={label}>
              {href ? (
                <Link
                  href={href}
                  className="flex min-h-11 items-center justify-center gap-1 card px-4 py-3 font-medium text-accent focus-ring hover:ring-line-strong"
                >
                  {label}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                // Not clickable, so drawn as a dashed outline, not a card.
                <span className="block rounded-xl border border-dashed border-line px-4 py-3 text-muted">
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
