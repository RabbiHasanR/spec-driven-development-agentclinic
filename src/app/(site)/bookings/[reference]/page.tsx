import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { getAppointmentByReference } from "@/lib/db/appointments";
import { getDb } from "@/lib/db/client";
import { BookingConfirmationPage } from "@/views/booking-confirmation/booking-confirmation-page";

// Shared by generateMetadata and Page so each request queries once.
const loadAppointment = cache(async (reference: string) => {
  await connection();
  return getAppointmentByReference(getDb(), reference) ?? notFound();
});

export async function generateMetadata({
  params,
}: PageProps<"/bookings/[reference]">): Promise<Metadata> {
  const { status } = await loadAppointment((await params).reference);
  // The page shows the agent's name and email; keep it out of search engines.
  return {
    title: status === "cancelled" ? "Booking cancelled" : "Booking confirmed",
    robots: { index: false },
  };
}

export default async function Page({
  params,
}: PageProps<"/bookings/[reference]">) {
  return (
    <BookingConfirmationPage
      appointment={await loadAppointment((await params).reference)}
    />
  );
}
