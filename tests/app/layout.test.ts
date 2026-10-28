import { describe, expect, it } from "vitest";
import { metadata } from "@/app/layout";
import { SITE } from "@/lib/site";

describe("Root layout metadata", () => {
  it("uses the site name as title and the site description", () => {
    expect(metadata.title).toBe(SITE.name);
    expect(metadata.description).toBe(SITE.description);
  });
});
