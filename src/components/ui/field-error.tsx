/** The id of a field's error message, for its `aria-describedby`. */
export function fieldErrorId(name: string): string {
  return `field-${name}-error`;
}

/** A form field's error message, rendered only when there is one. */
export function FieldError({ name, error }: { name: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={fieldErrorId(name)} className="mt-1 text-sm text-danger">
      {error}
    </p>
  );
}
