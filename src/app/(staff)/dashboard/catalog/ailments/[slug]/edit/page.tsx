import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { requireStaff } from "@/lib/auth/staff";
import { editAilment, removeAilment } from "@/lib/catalog/actions";
import { ailmentFormValues } from "@/lib/catalog/form-state";
import { getAilmentBySlug } from "@/lib/db/ailments";
import { getDb } from "@/lib/db/client";
import { listTherapies } from "@/lib/db/therapies";
import { AilmentEditorPage } from "@/views/ailment-editor/ailment-editor-page";

// Shared by generateMetadata and Page so each request checks and queries once.
const loadAilment = cache(async (slug: string) => {
  await requireStaff();
  await connection();
  return getAilmentBySlug(getDb(), slug) ?? notFound();
});

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/catalog/ailments/[slug]/edit">): Promise<Metadata> {
  const { name } = await loadAilment((await params).slug);
  return { title: `Edit ${name}`, robots: { index: false } };
}

export default async function Page({
  params,
}: PageProps<"/dashboard/catalog/ailments/[slug]/edit">) {
  const { slug } = await params;
  const ailment = await loadAilment(slug);
  return (
    <AilmentEditorPage
      title={`Edit ${ailment.name}`}
      therapies={listTherapies(getDb())}
      initialValues={ailmentFormValues(ailment)}
      saveAction={editAilment.bind(null, slug)}
      deleteAction={removeAilment.bind(null, slug)}
    />
  );
}
