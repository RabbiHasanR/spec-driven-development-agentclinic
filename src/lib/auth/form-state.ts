// Separate from actions.ts: a "use server" file may only export async
// functions, so the form's state type and initial value live here.

/**
 * What the sign-in action hands back after a failed attempt. The password is
 * never echoed back to the form.
 */
export type SignInFormState = {
  /** Shown next to their fields; only the password has one. */
  errors: { password?: string };
  /** A problem with sign-in as a whole (e.g. auth isn't configured). */
  message?: string;
};

export const INITIAL_SIGN_IN_FORM_STATE: SignInFormState = { errors: {} };

export const INCORRECT_PASSWORD_MESSAGE = "Incorrect password";

export const AUTH_UNAVAILABLE_MESSAGE =
  "Staff sign-in isn't set up on this server yet. Ask whoever runs it to configure it.";

/** The sign-in Server Action, as the form calls it. */
export type SignInAction = (
  state: SignInFormState,
  formData: FormData,
) => Promise<SignInFormState>;
