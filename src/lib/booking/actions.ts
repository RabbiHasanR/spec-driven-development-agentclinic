"use server";

import { redirect } from "next/navigation";
import { createAppointment, listOpenSlots } from "@/lib/db/appointments";
import { getDb } from "@/lib/db/client";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { bookingPath } from "@/lib/routes";
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
  if (!validation.ok) return { values, errors: validation.errors };

  const result = createAppointment(db, therapy, validation.value);
  if (!result.ok) {
    return { values, errors: { startsAt: SLOT_TAKEN_MESSAGE } };
  }
  redirect(bookingPath(result.appointment.reference));
}
