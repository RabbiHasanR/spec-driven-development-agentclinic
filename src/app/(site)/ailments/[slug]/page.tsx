import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getAilmentBySlug } from "@/lib/db/ailments";
import { getDb } from "@/lib/db/client";
import { AilmentDetailPage } from "@/views/ailment-detail/ailment-detail-page";

// Shared by generateMetadata and Page so each request queries once. Reads per
// request, like the list page, rather than relying on implicit caching.
const loadAilment = cache(async (slug: string) => {
  await connection();
  return getAilmentBySlug(getDb(), slug) ?? notFound();
});

export async function generateMetadata({
  params,
}: PageProps<"/ailments/[slug]">): Promise<Metadata> {
  const ailment = await loadAilment((await params).slug);
  return { title: ailment.name, description: ailment.summary };
}

export default async function Page({ params }: PageProps<"/ailments/[slug]">) {
  return <AilmentDetailPage ailment={await loadAilment((await params).slug)} />;
}
