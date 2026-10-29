import type { ComponentProps } from "react";

/** Shared shape: a 44px tap target with a visible focus ring. */
const BASE_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-5 font-medium focus-ring hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60";

/** Class names per kind of action. */
const VARIANT_CLASS = {
  /** The main action on a page. */
  primary: "bg-accent text-on-accent",
  /** A lesser action beside a primary one. */
  secondary: "bg-surface text-accent ring-1 ring-control",
  /** An action that can't be undone. */
  danger: "bg-danger text-on-accent",
} as const;

/** Action button with a 44px tap target. Defaults to `type="button"`. */
export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof VARIANT_CLASS }) {
  const classes = `${BASE_CLASS} ${VARIANT_CLASS[variant]}`;
  return (
    <button
      type={type}
      className={className ? `${classes} ${className}` : classes}
      {...props}
    />
  );
}
