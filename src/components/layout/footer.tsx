import { SITE } from "@/lib/site";
import styles from "@/styles/components/layout.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {SITE.name} — {SITE.tagline}
      </div>
    </footer>
  );
}
