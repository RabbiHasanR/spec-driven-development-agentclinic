import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { requireStaff } from "@/lib/auth/staff";
import { changeBookingStatus } from "@/lib/booking/actions";
import { allowedTransitions } from "@/lib/booking/status";
import { getAppointmentByReference } from "@/lib/db/appointments";
import { getDb } from "@/lib/db/client";
import { StaffBookingPage } from "@/views/staff-booking/staff-booking-page";

// Shared by generateMetadata and Page so each request checks and queries once.
const loadAppointment = cache(async (reference: string) => {
  await requireStaff();
  await connection();
  return getAppointmentByReference(getDb(), reference) ?? notFound();
});

export async function generateMetadata({
  params,
}: PageProps<"/dashboard/bookings/[reference]">): Promise<Metadata> {
  const { reference } = await loadAppointment((await params).reference);
  // Shows the agent's contact details; keep it out of search engines.
  return { title: `Booking ${reference}`, robots: { index: false } };
}

export default async function Page({
  params,
}: PageProps<"/dashboard/bookings/[reference]">) {
  const { reference } = await params;
  const appointment = await loadAppointment(reference);
  return (
    <StaffBookingPage
      appointment={appointment}
      allowed={allowedTransitions(appointment, new Date())}
      action={changeBookingStatus.bind(null, reference)}
    />
  );
}
