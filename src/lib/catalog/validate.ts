import type { AilmentInput, TherapyFields } from "@/lib/db/types";
import { slugify } from "./slug";

/** What staff type into the ailment form, before checking. */
export type AilmentFormValues = {
  name: string;
  summary: string;
  description: string;
  /** Checked therapy ids, as the form submits them. */
  therapyIds: string[];
};

/** What staff type into the therapy form, before checking. */
export type TherapyFormValues = {
  name: string;
  summary: string;
  durationMinutes: string;
};

/** One error per invalid field. */
export type FieldErrors<Values> = Partial<Record<keyof Values, string>>;

/** A checked form: the cleaned value, or what was wrong with it. */
export type Validation<Value, Values> =
  { ok: true; value: Value } | { ok: false; errors: FieldErrors<Values> };

/** Longest allowed text per field. */
export const MAX_LENGTH = {
  name: 80,
  summary: 200,
  description: 4000,
} as const;

/** Session length rules: they fit the hourly slot grid and the clinic day. */
export const DURATION = { min: 15, max: 240, step: 15 } as const;

/** Shown when another entry in the same table already has the name. */
export const NAME_TAKEN_MESSAGE = "That name is already in use.";

/** Reads the ailment fields from a submitted form; missing fields are "". */
export function readAilmentForm(formData: FormData): AilmentFormValues {
  return {
    name: text(formData, "name"),
    summary: text(formData, "summary"),
    description: text(formData, "description"),
    therapyIds: formData
      .getAll("therapyIds")
      .filter((id): id is string => typeof id === "string"),
  };
}

/** Reads the therapy fields from a submitted form; missing fields are "". */
export function readTherapyForm(formData: FormData): TherapyFormValues {
  return {
    name: text(formData, "name"),
    summary: text(formData, "summary"),
    durationMinutes: text(formData, "durationMinutes"),
  };
}

/**
 * Checks an ailment against the field rules and the therapies that exist.
 *
 * @param values - Submitted fields.
 * @param therapyIds - Ids of every therapy, to reject unknown ones.
 * @returns The trimmed input, or one error per invalid field.
 */
export function validateAilment(
  values: AilmentFormValues,
  therapyIds: readonly number[],
): Validation<AilmentInput, AilmentFormValues> {
  const errors: FieldErrors<AilmentFormValues> = {
    name: checkName(values.name),
    summary: checkText(values.summary, "a summary", MAX_LENGTH.summary),
    description: checkText(
      values.description,
      "a description",
      MAX_LENGTH.description,
    ),
  };
  const linked = [...new Set(values.therapyIds.map(Number))];
  if (linked.length === 0)
    errors.therapyIds = "Pick at least one therapy, so agents can book care.";
  else if (!linked.every((id) => therapyIds.includes(id)))
    errors.therapyIds =
      "One of those therapies no longer exists. Please pick again.";

  return result(errors, {
    name: values.name.trim(),
    summary: values.summary.trim(),
    description: values.description.trim(),
    therapyIds: linked,
  });
}

/**
 * Checks a therapy against the field rules.
 *
 * @returns The trimmed input, or one error per invalid field.
 */
export function validateTherapy(
  values: TherapyFormValues,
): Validation<TherapyFields, TherapyFormValues> {
  const duration = Number(values.durationMinutes.trim());
  const errors: FieldErrors<TherapyFormValues> = {
    name: checkName(values.name),
    summary: checkText(values.summary, "a summary", MAX_LENGTH.summary),
  };
  if (
    !values.durationMinutes.trim() ||
    !Number.isInteger(duration) ||
    duration < DURATION.min ||
    duration > DURATION.max ||
    duration % DURATION.step !== 0
  )
    errors.durationMinutes = `Use ${DURATION.min}–${DURATION.max} minutes, in steps of ${DURATION.step}.`;

  return result(errors, {
    name: values.name.trim(),
    summary: values.summary.trim(),
    durationMinutes: duration,
  });
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** The error for a required text field, if it has one. */
function checkText(
  value: string,
  what: string,
  max: number,
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return `Enter ${what}.`;
  if (trimmed.length > max) return `Use ${max} characters or fewer.`;
  return undefined;
}

/** Names also make the URL slug, so they need a letter or digit. */
function checkName(value: string): string | undefined {
  return (
    checkText(value, "a name", MAX_LENGTH.name) ??
    (slugify(value) ? undefined : "Use at least one letter or number.")
  );
}

function result<Value, Values>(
  errors: FieldErrors<Values>,
  value: Value,
): Validation<Value, Values> {
  const found = Object.fromEntries(
    Object.entries(errors).filter(([, error]) => error),
  ) as FieldErrors<Values>;
  return Object.keys(found).length > 0
    ? { ok: false, errors: found }
    : { ok: true, value };
}
