import type { ReactNode } from "react";
import { Button } from "./button";

/**
 * A "…" toggle that opens to explain an action that can't be undone, with
 * the button that actually submits it. Built on a native `<details>`, so it
 * works before JavaScript loads and with the keyboard. Place it inside the
 * `<form>` that handles the action.
 *
 * @param name - Optional `name`/`value` the confirm button submits.
 */
export function ConfirmDisclosure({
  label,
  confirmLabel,
  name,
  value,
  disabled,
  children,
}: {
  label: string;
  confirmLabel: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  /** What will happen, in a sentence or two. */
  children: ReactNode;
}) {
  return (
    <details>
      <summary className="inline-flex min-h-11 cursor-pointer items-center rounded font-medium text-danger focus-ring">
        {label}…
      </summary>
      <div className="mt-3 space-y-3 rounded-lg p-4 ring-1 ring-danger">
        <p>{children}</p>
        <Button
          type="submit"
          name={name}
          value={value}
          disabled={disabled}
          variant="danger"
          className="w-full sm:w-auto"
        >
          {confirmLabel}
        </Button>
      </div>
    </details>
  );
}
