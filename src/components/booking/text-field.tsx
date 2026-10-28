import type { ComponentProps } from "react";

/**
 * A labelled, full-width text input with an optional error message, wired up
 * with `aria-invalid` and `aria-describedby` for screen readers.
 */
export function TextField({
  name,
  label,
  error,
  ...inputProps
}: { name: string; label: string; error?: string } & Omit<
  ComponentProps<"input">,
  "name" | "id"
>) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="mt-1 block min-h-11 w-full rounded-lg bg-surface px-3 text-base ring-1 ring-line focus-ring aria-invalid:ring-2 aria-invalid:ring-danger"
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
