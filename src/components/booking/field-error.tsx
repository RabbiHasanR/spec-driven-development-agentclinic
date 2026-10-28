/** A form field's error message; `id` is what the field's aria-describedby points to. */
export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1 text-sm text-danger">
      {error}
    </p>
  );
}
