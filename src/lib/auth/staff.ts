import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { readAuthConfig, SESSION_COOKIE, verifySession } from "./session";

type SessionState = "signed-in" | "signed-out" | "misconfigured";

/**
 * Whether the request carries a valid staff session. Never throws, so the
 * shared header can call it on agent pages even when auth isn't configured.
 */
export async function isStaffSignedIn(): Promise<boolean> {
  return (await sessionState()) === "signed-in";
}

/**
 * The real gate for staff pages and Server Actions; `proxy.ts` only
 * redirects early. Call it first, before reading or changing any data.
 *
 * @throws Error when staff auth isn't configured (fail closed: the route's
 *   error page shows instead of the data).
 * @throws The `redirect()` signal to the login page when signed out.
 */
export async function requireStaff(): Promise<void> {
  const state = await sessionState();
  if (state === "misconfigured") {
    throw new Error(
      "Staff auth is not configured: set STAFF_PASSWORD and a SESSION_SECRET of at least 32 characters.",
    );
  }
  if (state === "signed-out") redirect(ROUTES.login);
}

async function sessionState(): Promise<SessionState> {
  // Read the cookie before anything else: it makes the caller request-time,
  // so the build never prerenders an answer from its own (empty) env.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const config = readAuthConfig();
  if (!config) return "misconfigured";
  return verifySession(token, config.secret, new Date())
    ? "signed-in"
    : "signed-out";
}
