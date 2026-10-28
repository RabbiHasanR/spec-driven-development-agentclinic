"use server";

import { refresh } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { createAppointment } from "@/lib/db/appointments";
import { getDb } from "@/lib/db/client";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { bookingPath } from "@/lib/routes";
import { listOpenSlots } from "./availability";
import type { BookingFormState } from "./form-state";
import {
  readBookingForm,
  SLOT_TAKEN_MESSAGE,
  validateBooking,
} from "./validate";

/**
 * Books an appointment from the booking form, then redirects to its
 * confirmation page. Server Actions are reachable by direct POST, so every
 * field, and the slot's availability, is re-checked here.
 *
 * @param therapySlug - Bound by the booking page.
 * @param _state - Previous form state (unused; required by `useActionState`).
 * @param formData - The submitted form.
 * @returns The form state with errors; on success it redirects instead.
 */
export async function bookAppointment(
  therapySlug: string,
  _state: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const db = getDb();
  const values = readBookingForm(formData);
  const therapy = getTherapyBySlug(db, therapySlug);
  if (!therapy) {
    return {
      values,
      errors: {},
      message: "This therapy is no longer available.",
    };
  }

  const validation = validateBooking(
    values,
    listOpenSlots(db, therapy, new Date()),
  );
  if (!validation.ok) {
    return validation.errors.startsAt
      ? slotUnavailable(values, validation.errors)
      : { values, errors: validation.errors };
  }

  const result = createAppointment(db, therapy, validation.value);
  if (!result.ok) {
    return slotUnavailable(values, { startsAt: SLOT_TAKEN_MESSAGE });
  }
  // Replace, so Back from the confirmation doesn't reopen the filled-in form.
  redirect(bookingPath(result.appointment.reference), RedirectType.replace);
}

/**
 * Form state for a slot that can't be booked. Refreshes the page so its slot
 * list drops times taken since it loaded, and clears the stale choice so it
 * isn't re-selected.
 */
function slotUnavailable(
  values: BookingFormState["values"],
  errors: BookingFormState["errors"],
): BookingFormState {
  refresh();
  return { values: { ...values, startsAt: "" }, errors };
}
