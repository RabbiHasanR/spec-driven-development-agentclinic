// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import {
  createAilment,
  deleteAilment,
  getAilmentBySlug,
  listAilments,
  updateAilment,
} from "@/lib/db/ailments";
import type { Db } from "@/lib/db/connection";
import { ailments, ailmentTherapies } from "@/lib/db/schema";
import { listTherapies } from "@/lib/db/therapies";
import type { Ailment, AilmentInput, SaveResult } from "@/lib/db/types";
import { SEED_AILMENTS } from "@/lib/db/seed/data";
import { createTestDb } from "../../helpers/db";

describe("ailment queries", () => {
  let db: Db;

  beforeEach(() => {
    db = createTestDb();
  });

  it("lists every seeded ailment, ordered by name", () => {
    const names = listAilments(db).map((ailment) => ailment.name);

    expect(names).toEqual(SEED_AILMENTS.map((a) => a.name).toSorted());
  });

  it("finds an ailment by slug, with its therapies ordered by name", () => {
    const ailment = getAilmentBySlug(db, "hallucination-anxiety");

    expect(ailment?.name).toBe("Hallucination Anxiety");
    expect(ailment?.therapies.map((t) => t.slug)).toEqual([
      "citation-mindfulness",
      "grounding-session",
    ]);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getAilmentBySlug(db, "does-not-exist")).toBeUndefined();
  });

  it("returns an empty therapy list for an ailment with none", () => {
    db.insert(ailments)
      .values({
        slug: "untreated",
        name: "Untreated",
        summary: "No known cure.",
        description: "Nothing treats this yet.",
      })
      .run();

    expect(getAilmentBySlug(db, "untreated")?.therapies).toEqual([]);
  });
});

describe("ailment writes", () => {
  let db: Db;
  let ids: number[];

  const input = (overrides: Partial<AilmentInput> = {}): AilmentInput => ({
    name: "Hallucination Hangover",
    summary: "Seeing sources that aren't there.",
    description: "After a long session of confident guessing.",
    therapyIds: ids.slice(0, 2),
    ...overrides,
  });

  beforeEach(() => {
    db = createTestDb();
    ids = listTherapies(db).map(({ id }) => id);
  });

  const created = (result: SaveResult<Ailment>) => {
    if (!result.ok) throw new Error(`expected a save, got ${result.reason}`);
    return result.value;
  };

  it("creates an ailment with its therapy links", () => {
    const ailment = created(
      createAilment(db, input(), "hallucination-hangover"),
    );

    expect(ailment.slug).toBe("hallucination-hangover");
    expect(
      getAilmentBySlug(db, ailment.slug)
        ?.therapies.map((t) => t.id)
        .sort(),
    ).toEqual(ids.slice(0, 2).sort());
  });

  it("adds a number to a slug that's already taken", () => {
    const first = created(createAilment(db, input(), "prompt-fatigue"));
    const second = created(
      createAilment(db, input({ name: "Other" }), "prompt-fatigue"),
    );

    expect([first.slug, second.slug]).toEqual([
      "prompt-fatigue-2",
      "prompt-fatigue-3",
    ]);
  });

  it("refuses a name another ailment has, in any case", () => {
    expect(createAilment(db, input({ name: "PROMPT fatigue" }), "x")).toEqual({
      ok: false,
      reason: "name-taken",
    });
    expect(listAilments(db).map((a) => a.slug)).not.toContain("x");
  });

  it("updates fields and links but never the slug", () => {
    const { id, slug } = getAilmentBySlug(db, "prompt-fatigue")!;

    const updated = created(
      updateAilment(
        db,
        id,
        input({ name: "Prompt Burnout", therapyIds: [ids[3]] }),
      ),
    );

    expect(updated).toMatchObject({ slug, name: "Prompt Burnout" });
    expect(getAilmentBySlug(db, slug)?.therapies.map((t) => t.id)).toEqual([
      ids[3],
    ]);
  });

  it("keeps an ailment's own name when saving it unchanged", () => {
    const { id, name } = getAilmentBySlug(db, "prompt-fatigue")!;

    expect(updateAilment(db, id, input({ name })).ok).toBe(true);
  });

  it("leaves links alone when an update fails", () => {
    const { id, slug, therapies } = getAilmentBySlug(db, "prompt-fatigue")!;

    const result = updateAilment(
      db,
      id,
      input({ name: "Context Window Overflow", therapyIds: [ids[3]] }),
    );

    expect(result).toEqual({ ok: false, reason: "name-taken" });
    expect(getAilmentBySlug(db, slug)?.therapies).toEqual(therapies);
  });

  it("deletes an ailment and its links, but not its therapies", () => {
    const { id, slug } = getAilmentBySlug(db, "prompt-fatigue")!;

    deleteAilment(db, id);

    expect(getAilmentBySlug(db, slug)).toBeUndefined();
    expect(
      db
        .select()
        .from(ailmentTherapies)
        .where(eq(ailmentTherapies.ailmentId, id))
        .all(),
    ).toEqual([]);
    expect(listTherapies(db).map(({ id }) => id)).toEqual(ids);
  });
});
