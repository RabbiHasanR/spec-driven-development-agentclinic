// Separate from actions.ts: a "use server" file may only export async
// functions, so the forms' state types and initial values live here.

import type { AilmentWithTherapies, Therapy } from "@/lib/db/types";
import type {
  AilmentFormValues,
  FieldErrors,
  TherapyFormValues,
} from "./validate";

/**
 * What a catalog save action hands back after a failed submit: the entered
 * values (so nothing is lost) and what was wrong with them.
 */
export type CatalogFormState<Values> = {
  values: Values;
  errors: FieldErrors<Values>;
  /** A problem with the whole form rather than one field. */
  message?: string;
};

export type AilmentFormState = CatalogFormState<AilmentFormValues>;
export type TherapyFormState = CatalogFormState<TherapyFormValues>;

export const EMPTY_AILMENT_VALUES: AilmentFormValues = {
  name: "",
  summary: "",
  description: "",
  therapyIds: [],
};

export const EMPTY_THERAPY_VALUES: TherapyFormValues = {
  name: "",
  summary: "",
  durationMinutes: "",
};

/** A save Server Action (bound to its entry, when editing), as forms call it. */
export type CatalogSaveAction<Values> = (
  state: CatalogFormState<Values>,
  formData: FormData,
) => Promise<CatalogFormState<Values>>;

/** What a delete action hands back when the entry can't be deleted. */
export type DeleteFormState = { message?: string };

/** A delete Server Action bound to its entry, as the delete form calls it. */
export type DeleteAction = (
  state: DeleteFormState,
  formData: FormData,
) => Promise<DeleteFormState>;

/** An ailment's current fields and therapy links, as its edit form starts. */
export function ailmentFormValues(
  ailment: AilmentWithTherapies,
): AilmentFormValues {
  return {
    name: ailment.name,
    summary: ailment.summary,
    description: ailment.description,
    therapyIds: ailment.therapies.map(({ id }) => String(id)),
  };
}

/** A therapy's current fields, as its edit form starts. */
export function therapyFormValues(therapy: Therapy): TherapyFormValues {
  return {
    name: therapy.name,
    summary: therapy.summary,
    durationMinutes: String(therapy.durationMinutes),
  };
}
