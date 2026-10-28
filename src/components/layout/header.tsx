import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/site";
import styles from "@/styles/components/layout.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" className={styles.brand}>
          {SITE.name}
        </Link>
        <nav aria-label="Main">
          <ul className={styles.navList}>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={styles.navLink}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
