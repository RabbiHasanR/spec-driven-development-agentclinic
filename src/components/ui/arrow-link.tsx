import Link from "next/link";
import type { ReactNode } from "react";

/** "label →" link to a next step, sized as a 44px tap target. */
export function ArrowLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center rounded font-medium text-accent focus-ring hover:underline ${className ?? ""}`}
    >
      {children}
      <span aria-hidden="true">&nbsp;→</span>
    </Link>
  );
}
