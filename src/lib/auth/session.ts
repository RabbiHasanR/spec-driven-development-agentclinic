// Pure session helpers, free of Next.js request APIs, so both proxy.ts and
// the server-only gate in staff.ts can use them, and tests can call them
// with a fixed clock.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { ROUTES } from "@/lib/routes";

/** Name of the staff session cookie. */
export const SESSION_COOKIE = "agentclinic_staff";

/** How long a staff session lasts: one 8-hour shift. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

/** Shortest `SESSION_SECRET` accepted; shorter keys are guessable. */
export const MIN_SECRET_LENGTH = 32;

/** Staff auth settings, read from the environment. */
export type AuthConfig = { password: string; secret: string };

/**
 * Reads the staff auth settings.
 *
 * @param env - Environment variables (defaults to `process.env`).
 * @returns The config, or `null` when `STAFF_PASSWORD` or `SESSION_SECRET` is
 *   missing or the secret is too short. Callers fail closed on `null`.
 */
export function readAuthConfig(
  env: Record<string, string | undefined> = process.env,
): AuthConfig | null {
  const password = env.STAFF_PASSWORD ?? "";
  const secret = env.SESSION_SECRET ?? "";
  if (!password || secret.length < MIN_SECRET_LENGTH) return null;
  return { password, secret };
}

/**
 * Creates a session token: its expiry time and an HMAC-SHA256 signature of it.
 *
 * @param expiresAt - When the session ends.
 * @param secret - The `SESSION_SECRET`.
 * @returns A cookie-safe token, `<expiry ms>.<base64url signature>`.
 */
export function signSession(expiresAt: Date, secret: string): string {
  const payload = String(expiresAt.getTime());
  return `${payload}.${sign(payload, secret)}`;
}

/**
 * Checks a session token's signature and expiry.
 *
 * @param token - The cookie value, if any.
 * @param secret - The `SESSION_SECRET`.
 * @param now - The current time.
 * @returns Whether the token is genuine and hasn't expired.
 */
export function verifySession(
  token: string | undefined,
  secret: string,
  now: Date,
): boolean {
  const [payload, signature, ...rest] = token?.split(".") ?? [];
  if (!payload || !signature || rest.length > 0) return false;
  if (!safeEqual(signature, sign(payload, secret))) return false;
  const expiresAt = Number(payload);
  return Number.isSafeInteger(expiresAt) && expiresAt > now.getTime();
}

/**
 * Compares a submitted password with the staff password in constant time,
 * so response timing doesn't reveal how much of it matched.
 */
export function passwordMatches(given: string, expected: string): boolean {
  // Hash first: timingSafeEqual needs equal lengths, and comparing lengths
  // directly would leak the password's length.
  return timingSafeEqual(sha256(given), sha256(expected));
}

/**
 * Where to send staff after signing in. Only same-site paths under the
 * dashboard are honored, so a crafted `?next=` can't redirect elsewhere.
 *
 * @param next - The requested path, from the login form.
 * @returns `next` (path and query) when safe, otherwise the dashboard.
 */
export function safeNextPath(next: unknown): string {
  if (typeof next !== "string") return ROUTES.dashboard;
  const base = "http://agentclinic.invalid";
  let url: URL;
  try {
    url = new URL(next, base);
  } catch {
    return ROUTES.dashboard;
  }
  const inDashboard =
    url.pathname === ROUTES.dashboard ||
    url.pathname.startsWith(`${ROUTES.dashboard}/`);
  return url.origin === base && inDashboard
    ? `${url.pathname}${url.search}`
    : ROUTES.dashboard;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
