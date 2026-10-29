import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/staff";
import { addTherapy } from "@/lib/catalog/actions";
import { EMPTY_THERAPY_VALUES } from "@/lib/catalog/form-state";
import { TherapyEditorPage } from "@/views/therapy-editor/therapy-editor-page";

export const metadata: Metadata = {
  title: "New therapy",
  robots: { index: false },
};

export default async function Page() {
  await requireStaff();
  return (
    <TherapyEditorPage
      title="New therapy"
      initialValues={EMPTY_THERAPY_VALUES}
      saveAction={addTherapy}
    />
  );
}
