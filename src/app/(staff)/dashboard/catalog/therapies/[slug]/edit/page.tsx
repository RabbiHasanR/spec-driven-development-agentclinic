import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { requireStaff } from "@/lib/auth/staff";
import { editTherapy, removeTherapy } from "@/lib/catalog/actions";
import { therapyFormValues } from "@/lib/catalog/form-state";
import { getDb } from "@/lib/db/client";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { TherapyEditorPage } from "@/views/therapy-editor/therapy-editor-page";

// Shared by generateMetadata and Page so each request checks and queries once.
const loadTherapy = cache(async (slug: string) => {
  await requireStaff();
  await connection();
  return getTherapyBySlug(getDb(), slug) ?? notFound();
});

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
