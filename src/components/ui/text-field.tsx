import type { ComponentProps } from "react";
import { CONTROL_CLASS, controlProps, Field } from "./field";

/**
 * A labelled, full-width text input with an optional error message, wired up
 * with `aria-invalid` and `aria-describedby` for screen readers.
 */
export function TextField({
  name,
  label,
  hint,
  error,
  ...inputProps
}: { name: string; label: string; hint?: string; error?: string } & Omit<
  ComponentProps<"input">,
  "name" | "id"
>) {
  return (
    <Field name={name} label={label} hint={hint} error={error}>
      <input
        {...controlProps(name, error)}
        className={`${CONTROL_CLASS} min-h-11`}
        {...inputProps}
      />
    </Field>
  );
}
