import type { Metadata } from "next";
import { staffLoader } from "@/lib/auth/staff";
import { changeBookingStatus } from "@/lib/booking/actions";
import { allowedChanges } from "@/lib/booking/status";
import { getAppointmentByReference } from "@/lib/db/appointments";
import { StaffBookingPage } from "@/views/staff-booking/staff-booking-page";

// Shared by generateMetadata and Page: one session check and query.
const loadAppointment = staffLoader(getAppointmentByReference);

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
      allowed={allowedChanges(appointment, new Date())}
      action={changeBookingStatus.bind(null, reference)}
    />
  );
}
