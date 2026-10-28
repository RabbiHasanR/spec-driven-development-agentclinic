import type { ScheduleOverview } from "@/lib/booking/overview";

/** The dashboard's headline numbers as a row of stat tiles. */
export function OverviewStats({ overview }: { overview: ScheduleOverview }) {
  const stats = [
    { label: "Today", value: String(overview.today) },
    { label: "Upcoming", value: String(overview.upcoming) },
    {
      label: "Busiest therapy",
      value: overview.busiestTherapy?.name ?? "—",
      note: overview.busiestTherapy
        ? `${overview.busiestTherapy.count} upcoming`
        : overview.upcoming > 0
          ? "No single leader yet"
          : undefined,
    },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {stats.map(({ label, value, note }) => (
        <div key={label} className="card p-5">
          <dt className="text-sm font-medium text-muted">{label}</dt>
          <dd className="mt-1 text-2xl font-semibold text-accent">{value}</dd>
          {note && <dd className="text-sm text-ink-soft">{note}</dd>}
        </div>
      ))}
    </dl>
  );
}
