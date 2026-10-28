import { formatZone, type SlotDay } from "@/lib/booking/format";
import { FieldError } from "./field-error";

/**
 * Open time slots as large radio buttons, one group per day. The native
 * radios stay in the DOM (visually hidden), so keyboard and screen reader
 * behavior is the browser's own.
 */
export function SlotPicker({
  name,
  days,
  defaultValue,
  error,
}: {
  name: string;
  days: SlotDay[];
  defaultValue: string;
  error?: string;
}) {
  const errorId = `${name}-error`;
  const firstSlot = days[0]?.slots[0]?.value;
  return (
    <fieldset
      aria-describedby={error ? errorId : undefined}
      className="min-w-0"
    >
      <legend className="font-medium">
        Pick a time{" "}
        {firstSlot && (
          <span className="font-normal text-muted">
            ({formatZone(firstSlot)})
          </span>
        )}
      </legend>
      <FieldError id={errorId} error={error} />
      <div className="mt-3 space-y-5">
        {days.map(({ day, slots }) => (
          <fieldset key={day} className="min-w-0">
            <legend className="text-sm font-medium text-ink-soft">{day}</legend>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
              {slots.map((slot) => (
                <label
                  key={slot.value}
                  className="flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-surface px-2 font-medium tabular-nums shadow-sm ring-1 ring-control hover:ring-2 has-checked:bg-accent has-checked:text-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
                >
                  <input
                    type="radio"
                    name={name}
                    value={slot.value}
                    defaultChecked={slot.value === defaultValue}
                    required
                    // On each radio too: screen readers read a focused
                    // radio's description, not its fieldset's.
                    aria-describedby={error ? errorId : undefined}
                    className="sr-only"
                  />
                  {slot.label}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </fieldset>
  );
}
