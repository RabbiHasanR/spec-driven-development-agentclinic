import { FieldError, fieldErrorId } from "./field-error";

/**
 * A labelled group of checkboxes, each a full 44px-tall row so it's easy to
 * tap. Submits every checked `value` under `name`.
 */
export function CheckboxGroup({
  name,
  legend,
  options,
  defaultValues,
  error,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string; detail?: string }[];
  defaultValues: readonly string[];
  error?: string;
}) {
  const describedBy = error ? fieldErrorId(name) : undefined;
  return (
    <fieldset aria-describedby={describedBy} className="min-w-0">
      <legend className="font-medium">{legend}</legend>
      <FieldError name={name} error={error} />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map(({ value, label, detail }) => (
          <label
            key={value}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg bg-surface px-3 py-2 ring-1 ring-control has-checked:ring-2 has-checked:ring-accent"
          >
            <input
              type="checkbox"
              name={name}
              value={value}
              defaultChecked={defaultValues.includes(value)}
              // On each box too: screen readers read a focused control's
              // description, not its fieldset's.
              aria-describedby={describedBy}
              className="size-5 shrink-0 accent-accent focus-ring"
            />
            <span>
              {label}
              {detail && (
                <span className="block text-sm text-muted">{detail}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
