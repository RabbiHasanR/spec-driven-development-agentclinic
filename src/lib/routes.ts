/** App URL paths: the one place routes are spelled out. */
export const ROUTES = {
  home: "/",
  ailments: "/ailments",
} as const;

/** URL of one ailment's detail page. */
export function ailmentPath(slug: string): string {
  return `${ROUTES.ailments}/${encodeURIComponent(slug)}`;
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
