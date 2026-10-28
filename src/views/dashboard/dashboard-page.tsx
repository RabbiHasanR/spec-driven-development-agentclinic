import { BookingsTable, OverviewStats } from "@/components/dashboard";
import { PageHeader } from "@/components/ui";
import type { Schedule, ScheduleOverview } from "@/lib/booking/overview";

/** Staff dashboard: headline numbers, then upcoming and past bookings. */
export function DashboardPage({
  schedule,
  overview,
}: {
  schedule: Schedule;
  overview: ScheduleOverview;
}) {
  const sections = [
    {
      id: "upcoming",
      title: "Upcoming bookings",
      appointments: schedule.upcoming,
      empty: "No upcoming bookings yet.",
    },
    {
      id: "past",
      title: "Past bookings",
      appointments: schedule.past,
      empty: "No past bookings.",
    },
  ];

  return (
    <div className="w-full">
      <PageHeader
        title="Dashboard"
        lead="Every booking at a glance, next appointment first."
      />
      <section aria-label="Overview" className="mt-8">
        <OverviewStats overview={overview} />
      </section>
      {sections.map(({ id, title, appointments, empty }) => (
        <section key={id} aria-labelledby={id} className="mt-10">
          <h2 id={id} className="text-xl font-semibold">
            {title}
          </h2>
          <div className="mt-4">
            {appointments.length > 0 ? (
              <BookingsTable caption={title} appointments={appointments} />
            ) : (
              <p className="text-muted">{empty}</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
