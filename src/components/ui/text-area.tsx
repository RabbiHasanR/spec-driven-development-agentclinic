import type { ComponentProps } from "react";
import { CONTROL_CLASS, controlProps, Field } from "./field";

/** A labelled, full-width multi-line text box; see {@link TextField}. */
export function TextArea({
  name,
  label,
  hint,
  error,
  rows = 5,
  ...textAreaProps
}: { name: string; label: string; hint?: string; error?: string } & Omit<
  ComponentProps<"textarea">,
  "name" | "id"
>) {
  return (
    <Field name={name} label={label} hint={hint} error={error}>
      <textarea
        {...controlProps(name, error)}
        rows={rows}
        className={`${CONTROL_CLASS} py-2`}
        {...textAreaProps}
      />
    </Field>
  );
}
