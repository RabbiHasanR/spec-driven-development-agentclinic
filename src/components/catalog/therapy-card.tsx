import type { Therapy } from "@/lib/db/types";
import { CardHeading, type HeadingLevel } from "./card-heading";

/** Therapy card: name, summary, and session length. */
export function TherapyCard({
  therapy,
  headingLevel = 3,
}: {
  therapy: Therapy;
  headingLevel?: HeadingLevel;
}) {
  return (
    <article className="h-full card p-5">
      <CardHeading level={headingLevel} className="text-lg font-semibold">
        {therapy.name}
      </CardHeading>
      <p className="mt-2 text-ink-soft">{therapy.summary}</p>
      <p className="mt-3 text-sm font-medium text-accent">
        {therapy.durationMinutes} min
      </p>
    </article>
  );
}
