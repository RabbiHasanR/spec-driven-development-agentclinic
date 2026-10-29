import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getDb } from "@/lib/db/client";
import type { Db } from "@/lib/db/connection";
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
      "Staff auth is not configured: set a STAFF_PASSWORD of at least 12 characters and a SESSION_SECRET of at least 32.",
    );
  }
  if (state === "signed-out") redirect(ROUTES.login);
}

/**
 * Makes the loader for a staff detail page: checks the session, reads per
 * request, and shows the not-found page when nothing matches. Cached per
 * request, so `generateMetadata` and the page share one check and query.
 *
 * @example const loadTherapy = staffLoader(getTherapyBySlug);
 * @param find - Looks the entry up by its URL key (slug or reference).
 */
export function staffLoader<T>(
  find: (db: Db, key: string) => T | undefined,
): (key: string) => Promise<T> {
  return cache(async (key: string) => {
    await requireStaff();
    await connection();
    return find(getDb(), key) ?? notFound();
  });
}

async function sessionState(): Promise<SessionState> {
  // Read the cookie before anything else: it makes the caller request-time,
  // so the build never prerenders an answer from its own (empty) env.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const config = readAuthConfig();
  if (!config) return "misconfigured";
  // Checking expiry reads the clock, which Cache Components only allows
  // once the render is tied to a real request.
  await connection();
  return verifySession(token, config, new Date()) ? "signed-in" : "signed-out";
}
