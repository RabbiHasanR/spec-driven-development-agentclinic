import { createElement, type ReactNode } from "react";

/** Heading level a card uses for its title, so it fits the page outline. */
export type HeadingLevel = 2 | 3 | 4;

/** A card title rendered as `<h2>`–`<h4>`, per `level`. */
export function CardHeading({
  level,
  className,
  children,
}: {
  level: HeadingLevel;
  className?: string;
  children: ReactNode;
}) {
  return createElement(`h${level}`, { className }, children);
}
