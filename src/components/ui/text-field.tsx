import type { ComponentProps } from "react";
import { classes, CONTROL_CLASS, controlProps, Field } from "./field";

/**
 * A labelled, full-width text input with an optional hint and error message,
 * wired up with `aria-invalid` and `aria-describedby` for screen readers.
 * A `className` adds to the control's classes rather than replacing them.
 */
export function TextField({
  name,
  label,
  hint,
  error,
  className,
  ...inputProps
}: { name: string; label: string; hint?: string; error?: string } & Omit<
  ComponentProps<"input">,
  "name" | "id" | "aria-describedby" | "aria-invalid"
>) {
  return (
    <Field name={name} label={label} hint={hint} error={error}>
      <input
        {...inputProps}
        {...controlProps(name, { hint, error })}
        className={classes(CONTROL_CLASS, "min-h-11", className)}
      />
    </Field>
  );
}
