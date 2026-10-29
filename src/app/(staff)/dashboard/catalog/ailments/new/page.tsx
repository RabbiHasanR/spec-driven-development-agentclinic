import type { Metadata } from "next";
import { connection } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { addAilment } from "@/lib/catalog/actions";
import { EMPTY_AILMENT_VALUES } from "@/lib/catalog/form-state";
import { getDb } from "@/lib/db/client";
import { listTherapies } from "@/lib/db/therapies";
import { AilmentEditorPage } from "@/views/ailment-editor/ailment-editor-page";

export const metadata: Metadata = {
  title: "New ailment",
  robots: { index: false },
};

export default async function Page() {
  await requireStaff();
  await connection();
  return (
    <AilmentEditorPage
      title="New ailment"
      therapies={listTherapies(getDb())}
      initialValues={EMPTY_AILMENT_VALUES}
      saveAction={addAilment}
    />
  );
}
