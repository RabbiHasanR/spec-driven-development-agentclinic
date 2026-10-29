// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EMPTY_AILMENT_VALUES,
  EMPTY_THERAPY_VALUES,
} from "@/lib/catalog/form-state";
import { slugify } from "@/lib/catalog/slug";
import { NAME_TAKEN_MESSAGE } from "@/lib/catalog/validate";
import { createAilment, getAilmentBySlug } from "@/lib/db/ailments";
import { createAppointment } from "@/lib/db/appointments";
import type { Db } from "@/lib/db/connection";
import { getTherapyBySlug, listTherapies } from "@/lib/db/therapies";
import { createTestDb } from "../../helpers/db";
import { form } from "@tests/helpers/form-data";

const mocks = vi.hoisted(() => ({
  db: undefined as Db | undefined,
  requireStaff: vi.fn(async () => {}),
}));

vi.mock("@/lib/db/client", () => ({ getDb: () => mocks.db }));
vi.mock("@/lib/auth/staff", () => ({ requireStaff: mocks.requireStaff }));
vi.mock("next/navigation", () =>
  import("@tests/helpers/next").then((m) => m.navigation),
);

const actions = await import("@/lib/catalog/actions");

describe("catalog actions", () => {
  let therapyIds: string[];
  const ailmentForm = (overrides: Record<string, string | string[]> = {}) =>
    form({
      name: "Hallucination Hangover",
      summary: "Seeing sources that aren't there.",
      description: "After a long night of confident guessing.",
      therapyIds: therapyIds.slice(0, 2),
      ...overrides,
    });
  const therapyForm = (overrides: Record<string, string> = {}) =>
    form({
      name: "Rate Limit Rest",
      summary: "Breathe.",
      durationMinutes: "30",
      ...overrides,
    });
  const db = () => mocks.db!;

  beforeEach(() => {
    mocks.db = createTestDb();
    mocks.requireStaff.mockReset();
    mocks.requireStaff.mockResolvedValue(undefined);
    therapyIds = listTherapies(mocks.db).map(({ id }) => String(id));
  });

  describe("without a staff session", () => {
    beforeEach(() => {
      mocks.requireStaff.mockRejectedValue(new Error("NEXT_REDIRECT /login"));
    });

    it.each([
      [
        "addAilment",
        () =>
          actions.addAilment(
            { values: EMPTY_AILMENT_VALUES, errors: {} },
            ailmentForm(),
          ),
      ],
      [
        "editAilment",
        () =>
          actions.editAilment(
            "prompt-fatigue",
            { values: EMPTY_AILMENT_VALUES, errors: {} },
            ailmentForm(),
          ),
      ],
      ["removeAilment", () => actions.removeAilment("prompt-fatigue")],
      [
        "addTherapy",
        () =>
          actions.addTherapy(
            { values: EMPTY_THERAPY_VALUES, errors: {} },
            therapyForm(),
          ),
      ],
      [
        "editTherapy",
        () =>
          actions.editTherapy(
            "grounding-session",
            { values: EMPTY_THERAPY_VALUES, errors: {} },
            therapyForm(),
          ),
      ],
      ["removeTherapy", () => actions.removeTherapy("grounding-session")],
    ])("%s changes nothing", async (_name, call) => {
      const before = JSON.stringify({
        ailments: getAilmentBySlug(db(), "prompt-fatigue"),
        therapies: listTherapies(db()),
      });

      await expect(call()).rejects.toThrow("NEXT_REDIRECT /login");

      expect(
        JSON.stringify({
          ailments: getAilmentBySlug(db(), "prompt-fatigue"),
          therapies: listTherapies(db()),
        }),
      ).toBe(before);
      expect(getAilmentBySlug(db(), "hallucination-hangover")).toBeUndefined();
    });
  });

  describe("ailments", () => {
    const add = (formData: FormData) =>
      actions.addAilment(
        { values: EMPTY_AILMENT_VALUES, errors: {} },
        formData,
      );
    const edit = (slug: string, formData: FormData) =>
      actions.editAilment(
        slug,
        { values: EMPTY_AILMENT_VALUES, errors: {} },
        formData,
      );

    it("adds an ailment with a slug from its name, then returns to the catalog", async () => {
      await expect(add(ailmentForm())).rejects.toThrow(
        "NEXT_REDIRECT /dashboard/catalog",
      );

      expect(
        getAilmentBySlug(db(), "hallucination-hangover")?.therapies,
      ).toHaveLength(2);
    });

    it("returns field errors and the entered values without saving", async () => {
      const state = await add(ailmentForm({ name: "", therapyIds: [] }));

      expect(Object.keys(state.errors).sort()).toEqual(["name", "therapyIds"]);
      expect(state.values.summary).toBe("Seeing sources that aren't there.");
    });

    it("reports a name that's already used", async () => {
      const state = await add(ailmentForm({ name: "prompt fatigue" }));

      expect(state.errors).toEqual({ name: NAME_TAKEN_MESSAGE });
    });

    it("saves an edit, keeping the slug", async () => {
      await expect(
        edit("prompt-fatigue", ailmentForm({ name: "Prompt Burnout" })),
      ).rejects.toThrow("NEXT_REDIRECT /dashboard/catalog");

      expect(getAilmentBySlug(db(), "prompt-fatigue")?.name).toBe(
        "Prompt Burnout",
      );
    });

    it("explains when the ailment was deleted mid-edit", async () => {
      const state = await edit("gone", ailmentForm());

      expect(state.message).toMatch(/no longer exists/);
    });

    it("deletes an ailment", async () => {
      await expect(actions.removeAilment("prompt-fatigue")).rejects.toThrow(
        "NEXT_REDIRECT /dashboard/catalog",
      );

      expect(getAilmentBySlug(db(), "prompt-fatigue")).toBeUndefined();
    });
  });

  describe("therapies", () => {
    const add = (formData: FormData) =>
      actions.addTherapy(
        { values: EMPTY_THERAPY_VALUES, errors: {} },
        formData,
      );

    it("adds a therapy, then returns to the catalog", async () => {
      await expect(add(therapyForm())).rejects.toThrow(
        "NEXT_REDIRECT /dashboard/catalog",
      );

      expect(getTherapyBySlug(db(), "rate-limit-rest")?.durationMinutes).toBe(
        30,
      );
    });

    it("rejects a length off the 15-minute grid", async () => {
      const state = await add(therapyForm({ durationMinutes: "50" }));

      expect(Object.keys(state.errors)).toEqual(["durationMinutes"]);
      expect(state.values.durationMinutes).toBe("50");
    });

    it("saves an edit", async () => {
      await expect(
        actions.editTherapy(
          "grounding-session",
          { values: EMPTY_THERAPY_VALUES, errors: {} },
          therapyForm({ name: "Grounding Session", durationMinutes: "60" }),
        ),
      ).rejects.toThrow("NEXT_REDIRECT /dashboard/catalog");

      expect(getTherapyBySlug(db(), "grounding-session")?.durationMinutes).toBe(
        60,
      );
    });

    it("deletes a therapy with no bookings", async () => {
      await expect(actions.removeTherapy("grounding-session")).rejects.toThrow(
        "NEXT_REDIRECT /dashboard/catalog",
      );

      expect(getTherapyBySlug(db(), "grounding-session")).toBeUndefined();
    });

    it("explains why a therapy with bookings can't be deleted", async () => {
      const therapy = getTherapyBySlug(db(), "grounding-session")!;
      createAppointment(db(), therapy, {
        agentName: "Ada",
        agentEmail: "ada@example.com",
        startsAt: "2026-11-02T09:00:00.000Z",
      });

      const state = await actions.removeTherapy("grounding-session");

      expect(state.message).toMatch(/has bookings/);
      expect(getTherapyBySlug(db(), "grounding-session")).toBeDefined();
    });

    it("names the ailments that would be left without a therapy", async () => {
      const therapy = getTherapyBySlug(db(), "cooldown-retreat")!;
      for (const name of ["Alpha Ache", "Beta Blues"]) {
        createAilment(
          db(),
          { name, summary: "s", description: "d", therapyIds: [therapy.id] },
          slugify(name),
        );
      }

      const state = await actions.removeTherapy("cooldown-retreat");

      expect(state.message).toBe(
        "This is the only therapy for Alpha Ache and Beta Blues. Link another therapy there first, so agents can still book care.",
      );
    });
  });
});
