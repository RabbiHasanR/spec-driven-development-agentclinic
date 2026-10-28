import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { NAV_LINKS, SITE } from "@/lib/site";
import styles from "@/styles/components/layout.module.css";
import { NavLink } from "./nav-link";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href={ROUTES.home} className={styles.brand}>
          {SITE.name}
        </Link>
        <nav aria-label="Main">
          <ul className={styles.navList}>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <NavLink href={href} label={label} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
