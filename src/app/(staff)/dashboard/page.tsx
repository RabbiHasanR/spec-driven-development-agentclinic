import type { Metadata } from "next";
import { connection } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { splitSchedule, summarizeSchedule } from "@/lib/booking/overview";
import { listAppointments } from "@/lib/db/appointments";
import { getDb } from "@/lib/db/client";
import { DashboardPage } from "@/views/dashboard/dashboard-page";

// Lists agents' contact details, so keep it out of search engines.
export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function Page() {
  await requireStaff();
  // Bookings change constantly; read them per request.
  await connection();
  const now = new Date();
  const schedule = splitSchedule(listAppointments(getDb()), now);
  return (
    <DashboardPage
      schedule={schedule}
      overview={summarizeSchedule(schedule, now)}
    />
  );
}
