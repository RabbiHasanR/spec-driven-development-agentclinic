import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { bookAppointment } from "@/lib/booking/actions";
import { listOpenSlots } from "@/lib/booking/availability";
import { getDb } from "@/lib/db/client";
import { getTherapyBySlug } from "@/lib/db/therapies";
import { BookTherapyPage } from "@/views/book-therapy/book-therapy-page";

// Shared by generateMetadata and Page so each request queries once. Its
// connection() also makes the page's slot read below per-request, which
// matters because open slots change with every booking.
const loadTherapy = cache(async (slug: string) => {
  await connection();
  return getTherapyBySlug(getDb(), slug) ?? notFound();
});

export async function generateMetadata({
  params,
}: PageProps<"/therapies/[slug]/book">): Promise<Metadata> {
  const therapy = await loadTherapy((await params).slug);
  return { title: `Book ${therapy.name}`, description: therapy.summary };
}

export default async function Page({
  params,
}: PageProps<"/therapies/[slug]/book">) {
  const therapy = await loadTherapy((await params).slug);
  return (
    <BookTherapyPage
      therapy={therapy}
      slots={listOpenSlots(getDb(), therapy, new Date())}
      action={bookAppointment.bind(null, therapy.slug)}
    />
  );
}
