"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/staff";
import {
  createAilment,
  deleteAilment,
  getAilmentBySlug,
  updateAilment,
} from "@/lib/db/ailments";
import { getDb } from "@/lib/db/client";
import type { Db } from "@/lib/db/connection";
import {
  createTherapy,
  deleteTherapy,
  getTherapyBySlug,
  listTherapies,
  updateTherapy,
} from "@/lib/db/therapies";
import type { SaveResult } from "@/lib/db/types";
import { ROUTES } from "@/lib/routes";
import type {
  AilmentFormState,
  CatalogFormState,
  DeleteFormState,
  TherapyFormState,
} from "./form-state";
import { slugify } from "./slug";
import {
  type FieldErrors,
  NAME_TAKEN_MESSAGE,
  readAilmentForm,
  readTherapyForm,
  validateAilment,
  validateTherapy,
  type Validation,
} from "./validate";

// Every action is reachable by direct POST, so each one checks the staff
// session first and re-validates everything it's sent.

/** Adds an ailment from the new-ailment form, then returns to the catalog. */
export async function addAilment(
  _state: AilmentFormState,
  formData: FormData,
): Promise<AilmentFormState> {
  await requireStaff();
  const db = getDb();
  return saveFromForm(
    readAilmentForm(formData),
    (values) => validateAilment(values, therapyIds(db)),
    (input) => createAilment(db, input, slugify(input.name)),
  );
}

/**
 * Saves the edit-ailment form, then returns to the catalog.
 *
 * @param slug - Bound by the edit page.
 */
export async function editAilment(
  slug: string,
  _state: AilmentFormState,
  formData: FormData,
): Promise<AilmentFormState> {
  await requireStaff();
  const db = getDb();
  const values = readAilmentForm(formData);
  const ailment = getAilmentBySlug(db, slug);
  if (!ailment) return gone(values, "ailment");
  return saveFromForm(
    values,
    (values) => validateAilment(values, therapyIds(db)),
    (input) => updateAilment(db, ailment.id, input),
  );
}

/**
 * Deletes an ailment (its therapy links go with it), then returns to the
 * catalog. An ailment that's already gone counts as deleted.
 *
 * @param slug - Bound by the edit page. The form's state and data are unused.
 */
export async function removeAilment(slug: string): Promise<DeleteFormState> {
  await requireStaff();
  const db = getDb();
  const ailment = getAilmentBySlug(db, slug);
  if (ailment) deleteAilment(db, ailment.id);
  redirect(ROUTES.catalog);
}

/** Adds a therapy from the new-therapy form, then returns to the catalog. */
export async function addTherapy(
  _state: TherapyFormState,
  formData: FormData,
): Promise<TherapyFormState> {
  await requireStaff();
  const db = getDb();
  return saveFromForm(readTherapyForm(formData), validateTherapy, (input) =>
    createTherapy(db, input, slugify(input.name)),
  );
}

/**
 * Saves the edit-therapy form, then returns to the catalog.
 *
 * @param slug - Bound by the edit page.
 */
export async function editTherapy(
  slug: string,
  _state: TherapyFormState,
  formData: FormData,
): Promise<TherapyFormState> {
  await requireStaff();
  const db = getDb();
  const values = readTherapyForm(formData);
  const therapy = getTherapyBySlug(db, slug);
  if (!therapy) return gone(values, "therapy");
  return saveFromForm(values, validateTherapy, (input) =>
    updateTherapy(db, therapy.id, input),
  );
}

/**
 * Deletes a therapy, then returns to the catalog. Refuses, with a reason,
 * when it has bookings or is some ailment's only therapy.
 *
 * @param slug - Bound by the edit page. The form's state and data are unused.
 */
export async function removeTherapy(slug: string): Promise<DeleteFormState> {
  await requireStaff();
  const db = getDb();
  const therapy = getTherapyBySlug(db, slug);
  const result = therapy
    ? deleteTherapy(db, therapy.id)
    : ({ ok: true } as const);
  if (result.ok) redirect(ROUTES.catalog);
  if (result.reason === "has-bookings") {
    return {
      message:
        "This therapy has bookings, so it can't be deleted. Its booking history would be lost.",
    };
  }
  return {
    message: `This is the only therapy for ${listNames(result.ailments)}. Link another therapy there first, so agents can still book care.`,
  };
}

/**
 * Validates submitted values and saves them; on success, returns to the
 * catalog. Shared by the add and edit actions for both tables.
 */
function saveFromForm<Values extends { name: string }, Input>(
  values: Values,
  validate: (values: Values) => Validation<Input, Values>,
  save: (input: Input) => SaveResult<unknown>,
): CatalogFormState<Values> {
  const validation = validate(values);
  if (!validation.ok) return { values, errors: validation.errors };
  if (!save(validation.value).ok) {
    const errors = { name: NAME_TAKEN_MESSAGE } as FieldErrors<Values>;
    return { values, errors };
  }
  redirect(ROUTES.catalog);
}

/** Form state for an entry deleted while it was being edited. */
function gone<Values>(
  values: Values,
  what: "ailment" | "therapy",
): CatalogFormState<Values> {
  return {
    values,
    errors: {},
    message: `This ${what} no longer exists. It may have just been deleted.`,
  };
}

function therapyIds(db: Db): number[] {
  return listTherapies(db).map(({ id }) => id);
}

/** "A", "A and B", "A, B, and C". */
function listNames(names: readonly string[]): string {
  return new Intl.ListFormat("en", { type: "conjunction" }).format(names);
}
