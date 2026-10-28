import Link from "next/link";
import type { Ailment } from "@/lib/db/types";
import { ailmentPath } from "@/lib/routes";
import { CardHeading, type HeadingLevel } from "./card-heading";

/** Ailment summary card; the whole card links to the ailment's detail page. */
export function AilmentCard({
  ailment,
  headingLevel = 2,
}: {
  ailment: Ailment;
  headingLevel?: HeadingLevel;
}) {
  return (
    <Link
      href={ailmentPath(ailment.slug)}
      className="block h-full card p-5 focus-ring transition hover:ring-line-strong"
    >
      <CardHeading
        level={headingLevel}
        className="text-lg font-semibold text-accent"
      >
        {ailment.name}
      </CardHeading>
      <p className="mt-2 text-ink-soft">{ailment.summary}</p>
    </Link>
  );
}
