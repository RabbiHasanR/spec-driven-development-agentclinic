import Link from "next/link";

/** "← label" link back to a parent page, sized as a 44px tap target. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1 rounded text-sm font-medium text-accent focus-ring hover:underline"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
