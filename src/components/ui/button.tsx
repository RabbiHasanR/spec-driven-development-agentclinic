import type { ComponentProps } from "react";

/** Class names for a primary action. */
const BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 font-medium text-on-accent focus-ring hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

/** Primary action button with a 44px tap target. Defaults to `type="button"`. */
export function Button({
  className,
  type = "button",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={className ? `${BUTTON_CLASS} ${className}` : BUTTON_CLASS}
      {...props}
    />
  );
}
