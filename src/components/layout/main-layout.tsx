import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";
import { MainContent } from "./main-content";
import styles from "./layout.module.css";

/** Page shell: site header, the page's main content, and footer. */
export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <Header />
      <MainContent>{children}</MainContent>
      <Footer />
    </div>
  );
}
