import { vi } from "vitest";
import {
  SESSION_COOKIE,
  signSession,
  type AuthConfig,
} from "@/lib/auth/session";

/** A valid test `SESSION_SECRET` (32+ characters). */
export const SECRET = "test-secret-that-is-long-enough-123";

export const PASSWORD = "correct horse battery";

/** The auth config `stubAuthEnv()` sets up. */
export const AUTH_CONFIG: AuthConfig = { password: PASSWORD, secret: SECRET };

/** Sets the staff auth env vars for one test file; undo with `vi.unstubAllEnvs()`. */
export function stubAuthEnv(): void {
  vi.stubEnv("STAFF_PASSWORD", PASSWORD);
  vi.stubEnv("SESSION_SECRET", SECRET);
}

type CookieOptions = Record<string, unknown>;

/**
 * An in-memory stand-in for the `cookies()` store from `next/headers`,
 * recording the options each cookie was set with.
 */
export function fakeCookieStore() {
  const values = new Map<string, string>();
  const options = new Map<string, CookieOptions>();
  return {
    values,
    options,
    get: (name: string) =>
      values.has(name) ? { name, value: values.get(name)! } : undefined,
    set: (name: string, value: string, opts: CookieOptions = {}) => {
      values.set(name, value);
      options.set(name, opts);
    },
    delete: (name: string) => {
      values.delete(name);
    },
    /** The current session token, if any. */
    session: () => values.get(SESSION_COOKIE),
  };
}

export type FakeCookieStore = ReturnType<typeof fakeCookieStore>;

/**
 * The cookie store `cookies()` returns in tests that mock `next/headers`
 * with {@link headers}. Shared, so a test can sign in and the code under test
 * sees the session.
 */
export const staffCookies = fakeCookieStore();

/** Stand-in for `next/headers`, backed by {@link staffCookies}. Mock with:
 *  vi.mock("next/headers", () => import("@tests/helpers/auth").then((m) => m.headers));
 */
export const headers = { cookies: async () => staffCookies };

/** Configures staff auth and signs in, as a staff member's browser would be. */
export function signInStaff(): void {
  stubAuthEnv();
  staffCookies.set(
    SESSION_COOKIE,
    signSession(new Date(Date.now() + 60 * 60 * 1000), AUTH_CONFIG),
  );
}

/** Ends the session; the next `requireStaff()` redirects to /login. */
export function signOutStaff(): void {
  staffCookies.delete(SESSION_COOKIE);
}
