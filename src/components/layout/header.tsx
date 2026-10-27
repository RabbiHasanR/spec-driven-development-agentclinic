import Link from "next/link";
import { SITE } from "@/lib/site";
import styles from "@/styles/components/layout.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${styles.headerInner}`}>
        <Link href="/" className={styles.brand}>
          {SITE.name}
        </Link>
      </div>
    </header>
  );
}
