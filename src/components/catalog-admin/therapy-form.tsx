"use client";

import { useActionState, useRef } from "react";
import {
  Button,
  FormMessage,
  TextField,
  useFocusFirstError,
} from "@/components/ui";
import type { CatalogSaveAction } from "@/lib/catalog/form-state";
import {
  DURATION,
  MAX_LENGTH,
  type TherapyFormValues,
} from "@/lib/catalog/validate";

/** Fields in on-screen order, so focus goes to the first one with an error. */
const FIELD_ORDER: (keyof TherapyFormValues)[] = [
  "name",
  "summary",
  "durationMinutes",
];

/** Add or edit a therapy; see {@link AilmentForm} for the error handling. */
export function TherapyForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: CatalogSaveAction<TherapyFormValues>;
  initialValues: TherapyFormValues;
  submitLabel: string;
}) {
  const [{ values, errors, message }, formAction, pending] = useActionState(
    action,
    { values: initialValues, errors: {} },
  );
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, errors, FIELD_ORDER);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <FormMessage message={message} />
      <TextField
        name="name"
        label="Name"
        maxLength={MAX_LENGTH.name}
        required
        defaultValue={values.name}
        error={errors.name}
      />
      <TextField
        name="summary"
        label="Summary"
        hint="One line, shown on therapy cards."
        maxLength={MAX_LENGTH.summary}
        required
        defaultValue={values.summary}
        error={errors.summary}
      />
      <TextField
        name="durationMinutes"
        label="Length (minutes)"
        hint={`${DURATION.min}–${DURATION.max}, in steps of ${DURATION.step}.`}
        type="number"
        inputMode="numeric"
        min={DURATION.min}
        max={DURATION.max}
        step={DURATION.step}
        required
        defaultValue={values.durationMinutes}
        error={errors.durationMinutes}
        className="sm:max-w-40"
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
