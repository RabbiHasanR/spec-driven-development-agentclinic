/**
 * Builds the FormData a browser would submit. An array value adds the field
 * once per item, as checked checkboxes do.
 */
export function form(values: Record<string, string | string[]>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(values)) {
    for (const item of [value].flat()) formData.append(name, item);
  }
  return formData;
}
