import Link from "next/link";

/** "← All ailments" link back to the catalog, sized as a 44px tap target. */
export function BackLink() {
  return (
    <Link
      href="/ailments"
      className="inline-flex min-h-11 items-center text-sm font-medium text-teal-700 hover:underline focus-visible:underline dark:text-teal-400"
    >
      ← All ailments
    </Link>
  );
}
