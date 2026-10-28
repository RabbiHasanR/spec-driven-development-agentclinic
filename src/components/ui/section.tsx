import type { ReactNode } from "react";

/**
 * A page section with an `<h2>` title, labelled by it for screen readers.
 *
 * @param id - Unique on the page; links the section to its heading.
 */
export function Section({
  id,
  title,
  className = "mt-10",
  children,
}: {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
