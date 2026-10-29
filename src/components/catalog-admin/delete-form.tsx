"use client";

import { useActionState } from "react";
import { ConfirmDisclosure, FormMessage } from "@/components/ui";
import type { DeleteAction } from "@/lib/catalog/form-state";

/**
 * Deletes a catalog entry after a confirm step. When the action refuses (for
 * example, a therapy with bookings), its reason shows as an alert.
 */
export function DeleteForm({
  action,
  label,
  consequence,
}: {
  action: DeleteAction;
  /** E.g. "Delete ailment". */
  label: string;
  /** What deleting will do, in a sentence. */
  consequence: string;
}) {
  const [{ message }, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={message} />
      <ConfirmDisclosure
        label={label}
        confirmLabel={`Yes, ${label.toLowerCase()}`}
        disabled={pending}
      >
        {consequence}
      </ConfirmDisclosure>
    </form>
  );
}
