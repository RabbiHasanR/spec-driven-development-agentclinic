/** Longest slug made from a name; long names are cut at a word boundary. */
export const MAX_SLUG_LENGTH = 60;

/**
 * Turns a name into a URL slug: lowercase ASCII letters and digits joined by
 * hyphens, with accents dropped.
 *
 * @example slugify("Prompt Fatigue (Chronic)") // "prompt-fatigue-chronic"
 * @example slugify("Café Crème") // "cafe-creme"
 * @returns The slug; empty if the name has no letters or digits.
 */
export function slugify(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (slug.length <= MAX_SLUG_LENGTH) return slug;
  const cut = slug.slice(0, MAX_SLUG_LENGTH);
  // Keep the cut if it already ends on a whole word; else drop the partial one.
  if (slug[MAX_SLUG_LENGTH] === "-" || !cut.includes("-")) return cut;
  return cut.slice(0, cut.lastIndexOf("-"));
}
