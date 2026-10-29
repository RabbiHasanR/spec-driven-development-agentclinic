"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button, FormMessage, TextField } from "@/components/ui";
import {
  INITIAL_SIGN_IN_FORM_STATE,
  type SignInAction,
} from "@/lib/auth/form-state";

/**
 * The staff sign-in form. A wrong password shows next to the field and moves
 * focus back to it, so screen readers announce the error and staff can retype.
 *
 * @param next - The staff page to return to after signing in.
 */
export function LoginForm({
  action,
  next,
}: {
  action: SignInAction;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_SIGN_IN_FORM_STATE,
  );
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) passwordRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage message={state.message} />
      {next && <input type="hidden" name="next" value={next} />}
      <TextField
        ref={passwordRef}
        name="password"
        label="Staff password"
        type="password"
        autoComplete="current-password"
        required
        error={state.error}
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
