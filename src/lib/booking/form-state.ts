// Separate from actions.ts: a "use server" file may only export async
// functions, so the form's state type and initial value live here.

import type { BookingFieldErrors, BookingInput } from "./validate";

/**
 * What the booking action hands back to the form after a failed submit: the
 * entered values (so nothing is lost) and what was wrong with them.
 */
export type BookingFormState = {
  values: BookingInput;
  errors: BookingFieldErrors;
  /** A problem with the whole form rather than one field. */
  message?: string;
};

export const INITIAL_BOOKING_FORM_STATE: BookingFormState = {
  values: { agentName: "", agentEmail: "", startsAt: "" },
  errors: {},
};

/** The booking Server Action, bound to its therapy, as the form calls it. */
export type BookingAction = (
  state: BookingFormState,
  formData: FormData,
) => Promise<BookingFormState>;
