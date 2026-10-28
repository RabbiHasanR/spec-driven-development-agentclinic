import { screen, within } from "@testing-library/react";

/**
 * The text of the first `<dd>` paired with the `<dt>` reading `term`, found
 * by role within their shared wrapper rather than by sibling position.
 */
export function definitionOf(term: string): string | null {
  // `term` takes no accessible name from its text, so match the text itself.
  const dt = screen
    .getAllByRole("term")
    .find((element) => element.textContent === term);
  if (!dt?.parentElement) throw new Error(`No term "${term}" found.`);
  return within(dt.parentElement).getAllByRole("definition")[0].textContent;
}
