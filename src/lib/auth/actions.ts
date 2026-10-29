"use server";

import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import {
  AUTH_UNAVAILABLE_MESSAGE,
  INCORRECT_PASSWORD_MESSAGE,
  type SignInFormState,
} from "./form-state";
import {
  passwordMatches,
  readAuthConfig,
  safeNextPath,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
} from "./session";

/**
 * Signs staff in with the shared password, sets the session cookie, and
 * redirects to the page they asked for (or the dashboard).
 *
 * @param _state - Previous form state (unused; required by `useActionState`).
 * @param formData - The submitted form: `password`, and `next` (optional).
 * @returns The form state with an error; on success it redirects instead.
 */
export async function signIn(
  _state: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const config = readAuthConfig();
  if (!config) return { errors: {}, message: AUTH_UNAVAILABLE_MESSAGE };

  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    !passwordMatches(password, config.password)
  ) {
    return { errors: { password: INCORRECT_PASSWORD_MESSAGE } };
  }

  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  (await cookies()).set(SESSION_COOKIE, signSession(expiresAt, config), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  // Replace, so Back from the dashboard doesn't return to the login form.
  redirect(safeNextPath(formData.get("next")), RedirectType.replace);
}

/** Ends the staff session and returns to the home page. */
export async function signOut(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect(ROUTES.home);
}
