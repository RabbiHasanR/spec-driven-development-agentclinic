/** App URL paths: the one place routes are spelled out. */
export const ROUTES = {
  home: "/",
  ailments: "/ailments",
  therapies: "/therapies",
  bookings: "/bookings",
  dashboard: "/dashboard",
} as const;

/** URL of one ailment's detail page. */
export function ailmentPath(slug: string): string {
  return `${ROUTES.ailments}/${encodeURIComponent(slug)}`;
}

/** URL of the booking page for one therapy. */
export function bookTherapyPath(slug: string): string {
  return `${ROUTES.therapies}/${encodeURIComponent(slug)}/book`;
}

/** URL of a booking's confirmation page. */
export function bookingPath(reference: string): string {
  return `${ROUTES.bookings}/${encodeURIComponent(reference)}`;
}

/**
 * Whether a nav link to `href` is the current page or one of its children.
 *
 * @example isActivePath("/ailments/prompt-fatigue", "/ailments") // true
 */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === ROUTES.home) return pathname === ROUTES.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}
