import type { ReactNode } from "react";

/**
 * A page's `<h1>` title with an optional lead paragraph.
 *
 * @param centered - Center the text (for short message pages).
 */
export function PageHeader({
  title,
  lead,
  centered = false,
}: {
  title: string;
  lead?: ReactNode;
  centered?: boolean;
}) {
  return (
    <header className={centered ? "text-center" : undefined}>
      <h1 className="text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
        {title}
      </h1>
      {lead && (
        <p
          className={`mt-3 max-w-2xl text-lg text-ink-soft ${centered ? "mx-auto" : ""}`}
        >
          {lead}
        </p>
      )}
    </header>
  );
}
