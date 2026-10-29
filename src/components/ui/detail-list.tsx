import type { ReactNode } from "react";

/** One labelled value in a {@link DetailList}. */
export type Detail = { term: string; value: ReactNode };

/**
 * Labelled details in a card: terms stack over their values on phones and
 * sit beside them from `sm` up.
 */
export function DetailList({
  details,
  className,
}: {
  details: Detail[];
  className?: string;
}) {
  return (
    <dl className={`divide-y divide-line card ${className ?? ""}`}>
      {details.map(({ term, value }) => (
        <div
          key={term}
          className="grid gap-1 px-5 py-3 sm:grid-cols-3 sm:gap-4"
        >
          <dt className="text-sm font-medium text-muted">{term}</dt>
          <dd className="font-medium sm:col-span-2">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
