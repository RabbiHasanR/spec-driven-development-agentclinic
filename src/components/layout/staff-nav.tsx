import { signOut } from "@/lib/auth/actions";
import { isStaffSignedIn } from "@/lib/auth/staff";
import { STAFF_NAV_LINKS } from "@/lib/site";
import styles from "@/styles/components/layout.module.css";
import { NavLink } from "./nav-link";

/**
 * Header items for signed-in staff. Reads the session cookie, so the header
 * renders it inside a `<Suspense>` boundary: the rest of the shell stays
 * static and these items stream in.
 */
export async function StaffNav() {
  return (await isStaffSignedIn()) ? <StaffNavItems /> : null;
}

/** The staff links and a sign-out button, as `<li>`s for the main nav list. */
export function StaffNavItems() {
  return (
    <>
      {STAFF_NAV_LINKS.map(({ href, label }) => (
        <li key={href}>
          <NavLink href={href} label={label} />
        </li>
      ))}
      <li>
        <form action={signOut}>
          <button type="submit" className={styles.navLink}>
            Sign out
          </button>
        </form>
      </li>
    </>
  );
}
