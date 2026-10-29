import { describe, expect, it } from "vitest";
import {
  MAX_LENGTH,
  readAilmentForm,
  readTherapyForm,
  validateAilment,
  validateTherapy,
} from "@/lib/catalog/validate";

const AILMENT = {
  name: "  Prompt Fatigue ",
  summary: " Worn down. ",
  description: " Exhaustion. ",
  therapyIds: ["1", "2", "2"],
};
const THERAPY = {
  name: " Grounding ",
  summary: " Reconnect. ",
  durationMinutes: "45",
};

describe("validateAilment", () => {
  it("accepts valid input, trimmed, with de-duplicated therapy ids", () => {
    expect(validateAilment(AILMENT, [1, 2, 3])).toEqual({
      ok: true,
      value: {
        name: "Prompt Fatigue",
        summary: "Worn down.",
        description: "Exhaustion.",
        therapyIds: [1, 2],
      },
    });
  });

  it("returns one error per invalid field", () => {
    const result = validateAilment(
      { name: " ", summary: "", description: "", therapyIds: [] },
      [1],
    );

    expect(result.ok || Object.keys(result.errors).sort()).toEqual([
      "description",
      "name",
      "summary",
      "therapyIds",
    ]);
  });

  it("needs at least one therapy, so agents can always book", () => {
    const result = validateAilment({ ...AILMENT, therapyIds: [] }, [1]);

    expect(result.ok || result.errors.therapyIds).toMatch(/at least one/);
  });

  it("rejects a therapy that doesn't exist", () => {
    const result = validateAilment({ ...AILMENT, therapyIds: ["99"] }, [1, 2]);

    expect(result.ok || result.errors.therapyIds).toMatch(/no longer exists/);
  });

  it("rejects text over the field limits", () => {
    const result = validateAilment(
      {
        ...AILMENT,
        name: "x".repeat(MAX_LENGTH.name + 1),
        description: "x".repeat(MAX_LENGTH.description + 1),
      },
      [1, 2],
    );

    expect(result.ok || result.errors).toEqual({
      name: `Use ${MAX_LENGTH.name} characters or fewer.`,
      description: `Use ${MAX_LENGTH.description} characters or fewer.`,
    });
  });

  it("needs a letter or digit in the name, which makes the URL", () => {
    const result = validateAilment({ ...AILMENT, name: "!!!" }, [1, 2]);

    expect(result.ok || result.errors.name).toBe(
      "Use at least one letter or number.",
    );
  });
});

describe("validateTherapy", () => {
  it("accepts valid input, trimmed, with the length as a number", () => {
    expect(validateTherapy(THERAPY)).toEqual({
      ok: true,
      value: { name: "Grounding", summary: "Reconnect.", durationMinutes: 45 },
    });
  });

  it.each(["15", "60", "240"])("accepts a %s-minute session", (minutes) => {
    expect(validateTherapy({ ...THERAPY, durationMinutes: minutes }).ok).toBe(
      true,
    );
  });

  it.each(["", "0", "10", "50", "255", "45.0001", "abc", "-15"])(
    "rejects a length of %j",
    (minutes) => {
      const result = validateTherapy({ ...THERAPY, durationMinutes: minutes });

      expect(result.ok || result.errors.durationMinutes).toBe(
        "Use 15–240 minutes, in steps of 15.",
      );
    },
  );
});

describe("reading the forms", () => {
  it("reads every checked therapy and treats missing fields as empty", () => {
    const formData = new FormData();
    formData.append("therapyIds", "1");
    formData.append("therapyIds", "3");

    expect(readAilmentForm(formData)).toEqual({
      name: "",
      summary: "",
      description: "",
      therapyIds: ["1", "3"],
    });
    expect(readTherapyForm(new FormData())).toEqual({
      name: "",
      summary: "",
      durationMinutes: "",
    });
  });
});
