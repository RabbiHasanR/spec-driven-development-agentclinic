"use client";

import { useActionState } from "react";
import { Button, ConfirmDisclosure, FormMessage } from "@/components/ui";
import {
  INITIAL_STATUS_FORM_STATE,
  type StatusAction,
} from "@/lib/booking/form-state";
import { CHANGE_LABELS, type StatusChange } from "@/lib/booking/status";

/**
 * Buttons for the status changes allowed right now. Each submits its status
 * as the form's `status` value. Cancelling frees the slot for other agents
 * and can't be undone, so it sits behind a {@link ConfirmDisclosure}.
 */
export function StatusActions({
  action,
  allowed,
}: {
  action: StatusAction;
  allowed: StatusChange[];
}) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_STATUS_FORM_STATE,
  );
  const visits = allowed.filter((change) => change !== "cancelled");

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage message={state.message} />
      {visits.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {visits.map((change, index) => (
            <Button
              key={change}
              type="submit"
              name="status"
              value={change}
              disabled={pending}
              variant={index === 0 ? "primary" : "secondary"}
            >
              {CHANGE_LABELS[change]}
            </Button>
          ))}
        </div>
      )}
      {allowed.includes("cancelled") && (
        <ConfirmDisclosure
          label={CHANGE_LABELS.cancelled}
          confirmLabel="Yes, cancel this booking"
          name="status"
          value="cancelled"
          disabled={pending}
        >
          The slot opens up for other agents. This can’t be undone; the agent
          would need to book again.
        </ConfirmDisclosure>
      )}
    </form>
  );
}
