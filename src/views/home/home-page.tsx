import { SITE } from "@/lib/site";

const UPCOMING_FEATURES = [
  "Browse ailments",
  "Discover therapies",
  "Book appointments",
] as const;

export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-xl text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-teal-800 sm:text-5xl dark:text-teal-300">
        {SITE.name}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-300">
        {SITE.tagline}
      </p>
      <section aria-labelledby="coming-soon" className="mt-10">
        <h2
          id="coming-soon"
          className="text-sm font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400"
        >
          Coming soon
        </h2>
        <ul className="mt-4 space-y-2">
          {UPCOMING_FEATURES.map((feature) => (
            <li
              key={feature}
              className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-teal-100 dark:bg-slate-900 dark:ring-slate-800"
            >
              {feature}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
