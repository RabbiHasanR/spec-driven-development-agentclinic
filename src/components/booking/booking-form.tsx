"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import type { SlotDay } from "@/lib/booking/format";
import {
  INITIAL_BOOKING_FORM_STATE,
  type BookingAction,
} from "@/lib/booking/form-state";
import {
  MAX_EMAIL_LENGTH,
  MAX_NAME_LENGTH,
  type BookingInput,
} from "@/lib/booking/validate";
import { SlotPicker } from "./slot-picker";
import { TextField } from "./text-field";

/** Fields in on-screen order, so focus goes to the first one with an error. */
const FIELD_ORDER: (keyof BookingInput)[] = [
  "agentName",
  "agentEmail",
  "startsAt",
];

/**
 * The booking form. The browser checks required fields and the email format
 * before submitting, so this works before JavaScript loads. The Server Action
 * re-checks everything; its errors (e.g. a slot just taken) show next to
 * their fields, with the entered values kept, and focus moves to the first
 * one so screen readers announce it. Name and email come before the long
 * slot list, so phones don't have to scroll past every slot to reach them.
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
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const field = FIELD_ORDER.find((name) => errors[name]);
    if (!field) return;
    const control = formRef.current?.elements.namedItem(field);
    const target = control instanceof RadioNodeList ? control[0] : control;
    if (target instanceof HTMLElement) target.focus();
  }, [errors]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {message && (
        <p
          role="alert"
          className="rounded-lg p-3 text-danger ring-1 ring-danger"
        >
          {message}
        </p>
      )}
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
      <SlotPicker
        name="startsAt"
        days={slotDays}
        defaultValue={values.startsAt}
        error={errors.startsAt}
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Booking…" : "Book appointment"}
      </Button>
    </form>
  );
}
