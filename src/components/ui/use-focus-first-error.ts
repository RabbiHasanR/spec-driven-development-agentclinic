"use client";

import { useEffect, type RefObject } from "react";

/**
 * After a failed submit, moves focus to the first field (in on-screen order)
 * that has an error, so screen readers announce it and the user can fix it.
 * For a radio or checkbox group, the first control in the group gets focus.
 *
 * @param formRef - The form holding the fields.
 * @param errors - The latest field errors; a new object triggers the move.
 * @param fieldOrder - Field names in on-screen order.
 */
export function useFocusFirstError<Name extends string>(
  formRef: RefObject<HTMLFormElement | null>,
  errors: Partial<Record<Name, string>>,
  fieldOrder: readonly Name[],
): void {
  useEffect(() => {
    const field = fieldOrder.find((name) => errors[name]);
    if (!field) return;
    const control = formRef.current?.elements.namedItem(field);
    const target = control instanceof RadioNodeList ? control[0] : control;
    if (target instanceof HTMLElement) target.focus();
    // fieldOrder is a constant per form; only new errors should refocus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors]);
}
