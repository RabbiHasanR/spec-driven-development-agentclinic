"use client";

import { useActionState, useRef } from "react";
import {
  Button,
  CheckboxGroup,
  FormMessage,
  TextArea,
  TextField,
  useFocusFirstError,
} from "@/components/ui";
import type { AilmentFormValues } from "@/lib/catalog/validate";
import { MAX_LENGTH } from "@/lib/catalog/validate";
import type { CatalogSaveAction } from "@/lib/catalog/form-state";
import type { Therapy } from "@/lib/db/types";

/** Fields in on-screen order, so focus goes to the first one with an error. */
const FIELD_ORDER: (keyof AilmentFormValues)[] = [
  "name",
  "summary",
  "description",
  "therapyIds",
];

/**
 * Add or edit an ailment, including which therapies treat it. The Server
 * Action re-checks everything; its errors show next to their fields, with
 * the entered values kept.
 */
export function AilmentForm({
  action,
  therapies,
  initialValues,
  submitLabel,
}: {
  action: CatalogSaveAction<AilmentFormValues>;
  therapies: Therapy[];
  initialValues: AilmentFormValues;
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
        hint="One line, shown on the ailment list."
        maxLength={MAX_LENGTH.summary}
        required
        defaultValue={values.summary}
        error={errors.summary}
      />
      <TextArea
        name="description"
        label="Description"
        maxLength={MAX_LENGTH.description}
        required
        defaultValue={values.description}
        error={errors.description}
      />
      <CheckboxGroup
        name="therapyIds"
        legend="Therapies that treat it"
        options={therapies.map((t) => ({
          value: String(t.id),
          label: t.name,
          detail: `${t.durationMinutes} min`,
        }))}
        defaultValues={values.therapyIds}
        error={errors.therapyIds}
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
