import { describe, expect, it } from "vitest";
import { MAX_SLUG_LENGTH, slugify } from "@/lib/catalog/slug";

describe("slugify", () => {
  it.each([
    ["Prompt Fatigue", "prompt-fatigue"],
    ["  Prompt   Fatigue  ", "prompt-fatigue"],
    ["Prompt Fatigue (Chronic)", "prompt-fatigue-chronic"],
    ["Café Crème", "cafe-creme"],
    ["Token-Budget  Coaching!", "token-budget-coaching"],
    ["“I don’t know” therapy", "i-don-t-know-therapy"],
    ["Version 2.0", "version-2-0"],
    ["!!!", ""],
  ])("turns %j into %j", (name, slug) => {
    expect(slugify(name)).toBe(slug);
  });

  it("cuts long names at a word boundary", () => {
    const slug = slugify("word ".repeat(30));

    expect(slug.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
    expect(slug).toMatch(/^(word-)*word$/);
  });

  it("keeps a word that ends exactly at the limit", () => {
    const name = `${"a".repeat(MAX_SLUG_LENGTH)} tail`;

    expect(slugify(name)).toBe("a".repeat(MAX_SLUG_LENGTH));
  });
});
