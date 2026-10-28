"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import type { SlotDay } from "@/lib/booking/format";
import {
  INITIAL_BOOKING_FORM_STATE,
  type BookingAction,
} from "@/lib/booking/form-state";
import { MAX_EMAIL_LENGTH, MAX_NAME_LENGTH } from "@/lib/booking/validate";
import { SlotPicker } from "./slot-picker";
import { TextField } from "./text-field";

/**
 * The booking form. The browser checks required fields and the email format
 * before submitting, so this works before JavaScript loads. The Server Action
 * re-checks everything; its errors (e.g. a slot just taken) show next to
 * their fields, with the entered values kept.
 */
export function BookingForm({
  action,
  slotDays,
}: {
  action: BookingAction;
  slotDays: SlotDay[];
}) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_BOOKING_FORM_STATE,
  );
  const { values, errors, message } = state;

  return (
    <form action={formAction} className="space-y-6">
      {message && (
        <p
          role="alert"
          className="rounded-lg p-3 text-danger ring-1 ring-danger"
        >
          {message}
        </p>
      )}
      <SlotPicker
        name="startsAt"
        days={slotDays}
        defaultValue={values.startsAt}
        error={errors.startsAt}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          name="agentName"
          label="Your name"
          autoComplete="name"
          maxLength={MAX_NAME_LENGTH}
          required
          defaultValue={values.agentName}
          error={errors.agentName}
        />
        <TextField
          name="agentEmail"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={MAX_EMAIL_LENGTH}
          required
          defaultValue={values.agentEmail}
          error={errors.agentEmail}
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Booking…" : "Book appointment"}
      </Button>
    </form>
  );
}
