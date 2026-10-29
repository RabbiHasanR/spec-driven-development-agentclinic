"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import {
  INITIAL_STATUS_FORM_STATE,
  type StatusAction,
} from "@/lib/booking/form-state";
import { CHANGE_LABELS, type StatusChange } from "@/lib/booking/status";

/**
 * Buttons for the status changes allowed right now. Each submits its status
 * as the form's `status` value. Cancelling frees the slot for other agents
 * and can't be undone, so it sits behind a disclosure that asks to confirm:
 * a native `<details>`, which works before JavaScript loads and with the
 * keyboard.
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
      {state.message && (
        <p
          role="alert"
          className="rounded-lg p-3 text-danger ring-1 ring-danger"
        >
          {state.message}
        </p>
      )}
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
        <details>
          <summary className="inline-flex min-h-11 cursor-pointer items-center rounded font-medium text-danger focus-ring">
            {CHANGE_LABELS.cancelled}…
          </summary>
          <div className="mt-3 space-y-3 rounded-lg p-4 ring-1 ring-danger">
            <p>
              The slot opens up for other agents. This can’t be undone; the
              agent would need to book again.
            </p>
            <Button
              type="submit"
              name="status"
              value="cancelled"
              disabled={pending}
              variant="danger"
              className="w-full sm:w-auto"
            >
              Yes, cancel this booking
            </Button>
          </div>
        </details>
      )}
    </form>
  );
}
