import { formatSlot } from "@/lib/booking/format";
import type { AppointmentWithTherapy } from "@/lib/db/types";

const COLUMNS: {
  label: string;
  value: (appointment: AppointmentWithTherapy) => string;
}[] = [
  { label: "When", value: (a) => formatSlot(a.startsAt) },
  { label: "Therapy", value: (a) => a.therapy.name },
  { label: "Agent", value: (a) => a.agentName },
  { label: "Email", value: (a) => a.agentEmail },
  { label: "Reference", value: (a) => a.reference },
];

/**
 * Bookings as a table on wider screens and as cards on phones, so the page
 * never scrolls sideways. Only one of the two is displayed at a time.
 */
export function BookingsTable({
  caption,
  appointments,
}: {
  caption: string;
  appointments: AppointmentWithTherapy[];
}) {
  return (
    <>
      <div className="hidden overflow-x-auto card md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="text-muted">
            <tr>
              {COLUMNS.map(({ label }) => (
                <th key={label} scope="col" className="px-4 py-3 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line border-t border-line">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                {COLUMNS.map(({ label, value }) => (
                  <td
                    key={label}
                    className="px-4 py-3 [overflow-wrap:anywhere]"
                  >
                    {value(appointment)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={caption} className="space-y-3 md:hidden">
        {appointments.map((appointment) => (
          <li key={appointment.id} className="card p-4">
            <dl className="grid grid-cols-3 gap-x-3 gap-y-1 text-sm">
              {COLUMNS.map(({ label, value }) => (
                <div key={label} className="contents">
                  <dt className="text-muted">{label}</dt>
                  <dd className="col-span-2 [overflow-wrap:anywhere]">
                    {value(appointment)}
                  </dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
