import type { ReactNode } from "react";
import styles from "./layout.module.css";

export function MainContent({ children }: { children: ReactNode }) {
  return (
    <main className={styles.main}>
      <div className={styles.container}>{children}</div>
    </main>
  );
}
