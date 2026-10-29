/** App URL paths: the one place routes are spelled out. */
export const ROUTES = {
  home: "/",
  ailments: "/ailments",
  dashboard: "/dashboard",
  login: "/login",
} as const;

// Path prefixes with no page of their own; only the builders below use them.
const THERAPIES_PREFIX = "/therapies";
const BOOKINGS_PREFIX = "/bookings";

/** URL of one ailment's detail page. */
export function ailmentPath(slug: string): string {
  return `${ROUTES.ailments}/${encodeURIComponent(slug)}`;
}

/** URL of the booking page for one therapy. */
export function bookTherapyPath(slug: string): string {
  return `${THERAPIES_PREFIX}/${encodeURIComponent(slug)}/book`;
}

/** URL of a booking's confirmation page. */
export function bookingPath(reference: string): string {
  return `${BOOKINGS_PREFIX}/${encodeURIComponent(reference)}`;
}

/** URL of a booking's staff page, where its status is managed. */
export function staffBookingPath(reference: string): string {
  return `${ROUTES.dashboard}${BOOKINGS_PREFIX}/${encodeURIComponent(reference)}`;
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
