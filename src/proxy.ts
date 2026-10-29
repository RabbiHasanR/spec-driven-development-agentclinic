import { NextResponse, type NextRequest } from "next/server";
import {
  readAuthConfig,
  SESSION_COOKIE,
  verifySession,
} from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

/**
 * Sends signed-out visitors from staff pages to the login page, remembering
 * where they were going. This is only the early, optimistic check:
 * `requireStaff()` in each staff page and action is the real gate.
 *
 * When auth isn't configured the request passes through, so the page's
 * `requireStaff()` shows the error page instead of a login that can't work.
 */
export function proxy(request: NextRequest): NextResponse {
  const config = readAuthConfig();
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!config || verifySession(token, config.secret, new Date())) {
    return NextResponse.next();
  }
  const login = new URL(ROUTES.login, request.url);
  const { pathname, search } = request.nextUrl;
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

// Must be a literal for build-time analysis; matches /dashboard and below.
export const config = {
  matcher: "/dashboard/:path*",
};
