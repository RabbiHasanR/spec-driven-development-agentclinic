"use client"; // Reads the current URL to mark the active link.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { isActivePath } from "@/lib/routes";
import styles from "@/styles/components/layout.module.css";

type NavLinkProps = { href: string; label: string };

/**
 * Header nav link; marked `aria-current="page"` on its page and children.
 *
 * With Cache Components, the pathname of a dynamic route (e.g.
 * `/ailments/[slug]`) is only known per request, so the prerendered shell
 * shows the plain link and the active state streams in.
 */
export function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<NavAnchor {...props} />}>
      <ActiveNavLink {...props} />
    </Suspense>
  );
}

function ActiveNavLink(props: NavLinkProps) {
  const pathname = usePathname() ?? "";
  return <NavAnchor {...props} current={isActivePath(pathname, props.href)} />;
}

function NavAnchor({
  href,
  label,
  current = false,
}: NavLinkProps & { current?: boolean }) {
  return (
    <Link
      href={href}
      className={styles.navLink}
      aria-current={current ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
