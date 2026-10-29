import type { ReactNode } from "react";
import { FieldError, fieldErrorId } from "./field-error";

/** Class names shared by text inputs and text areas. */
export const CONTROL_CLASS =
  "mt-1 block w-full rounded-lg bg-surface px-3 text-base ring-1 ring-control focus-ring aria-invalid:ring-2 aria-invalid:ring-danger";

/** What a field shows around its control. */
type FieldText = { hint?: string; error?: string };

/**
 * The id and ARIA wiring a form control needs: its label's target, and a
 * description made of its hint and error (screen readers read both).
 */
export function controlProps(name: string, { hint, error }: FieldText = {}) {
  const describedBy = [hint && fieldHintId(name), error && fieldErrorId(name)]
    .filter(Boolean)
    .join(" ");
  return {
    id: fieldId(name),
    name,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  } as const;
}

/** The id of a field's control, for its `<label htmlFor>`. */
export function fieldId(name: string): string {
  return `field-${name}`;
}

/** The id of a field's hint, for its control's `aria-describedby`. */
export function fieldHintId(name: string): string {
  return `field-${name}-hint`;
}

/** Joins class names, skipping empty ones. */
export function classes(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

/** A label above a control, with the control's error message below it. */
export function Field({
  name,
  label,
  hint,
  error,
  children,
}: {
  name: string;
  label: string;
  /** Extra guidance, shown under the label. */
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={fieldId(name)} className="block font-medium">
        {label}
      </label>
      {hint && (
        <p id={fieldHintId(name)} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {children}
      <FieldError name={name} error={error} />
    </div>
  );
}
