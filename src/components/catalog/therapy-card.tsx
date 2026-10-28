import { ArrowLink } from "@/components/ui";
import type { Therapy } from "@/lib/db/types";
import { bookTherapyPath } from "@/lib/routes";
import { CardHeading, type HeadingLevel } from "./card-heading";

/** Therapy card: name, summary, session length, and a link to book it. */
export function TherapyCard({
  therapy,
  headingLevel = 3,
}: {
  therapy: Therapy;
  headingLevel?: HeadingLevel;
}) {
  return (
    <article className="flex h-full flex-col card p-5">
      <CardHeading level={headingLevel} className="text-lg font-semibold">
        {therapy.name}
      </CardHeading>
      <p className="mt-2 text-ink-soft">{therapy.summary}</p>
      <p className="mt-3 text-sm font-medium text-accent">
        {therapy.durationMinutes} min
      </p>
      <ArrowLink
        href={bookTherapyPath(therapy.slug)}
        className="mt-4 self-start"
      >
        Book <span className="sr-only">{therapy.name}</span>
      </ArrowLink>
    </article>
  );
}
