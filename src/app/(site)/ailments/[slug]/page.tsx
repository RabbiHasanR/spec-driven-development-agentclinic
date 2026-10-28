import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getAilmentBySlug } from "@/lib/db/ailments";
import { getDb } from "@/lib/db/client";
import { AilmentDetailPage } from "@/views/ailment-detail/ailment-detail-page";

// Shared by generateMetadata and Page so each request queries once.
const loadAilment = cache(
  (slug: string) => getAilmentBySlug(getDb(), slug) ?? notFound(),
);

export async function generateMetadata({
  params,
}: PageProps<"/ailments/[slug]">): Promise<Metadata> {
  const ailment = loadAilment((await params).slug);
  return { title: ailment.name, description: ailment.summary };
}

export default async function Page({ params }: PageProps<"/ailments/[slug]">) {
  return <AilmentDetailPage ailment={loadAilment((await params).slug)} />;
}
