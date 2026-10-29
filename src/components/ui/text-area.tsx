import type { ComponentProps } from "react";
import { classes, CONTROL_CLASS, controlProps, Field } from "./field";

/** A labelled, full-width multi-line text box; see {@link TextField}. */
export function TextArea({
  name,
  label,
  hint,
  error,
  className,
  rows = 5,
  ...textAreaProps
}: { name: string; label: string; hint?: string; error?: string } & Omit<
  ComponentProps<"textarea">,
  "name" | "id" | "aria-describedby" | "aria-invalid"
>) {
  return (
    <Field name={name} label={label} hint={hint} error={error}>
      <textarea
        {...textAreaProps}
        {...controlProps(name, { hint, error })}
        rows={rows}
        className={classes(CONTROL_CLASS, "py-2", className)}
      />
    </Field>
  );
}
