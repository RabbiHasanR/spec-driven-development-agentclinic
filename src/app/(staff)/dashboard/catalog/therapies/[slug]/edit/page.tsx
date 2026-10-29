import type { Metadata } from "next";
import { staffLoader } from "@/lib/auth/staff";
import { editTherapy, removeTherapy } from "@/lib/catalog/actions";
import { therapyFormValues } from "@/lib/catalog/form-state";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { TherapyEditorPage } from "@/views/therapy-editor/therapy-editor-page";

// Shared by generateMetadata and Page: one session check and query.
const loadTherapy = staffLoader(getTherapyBySlug);

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/catalog/therapies/[slug]/edit">): Promise<Metadata> {
  const { name } = await loadTherapy((await params).slug);
  return { title: `Edit ${name}`, robots: { index: false } };
}

export default async function Page({
  params,
}: PageProps<"/dashboard/catalog/therapies/[slug]/edit">) {
  const { slug } = await params;
  const therapy = await loadTherapy(slug);
  return (
    <TherapyEditorPage
      title={`Edit ${therapy.name}`}
      initialValues={therapyFormValues(therapy)}
      saveAction={editTherapy.bind(null, slug)}
      deleteAction={removeTherapy.bind(null, slug)}
    />
  );
}
