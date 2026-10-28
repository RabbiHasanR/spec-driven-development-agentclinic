import { ArrowLink, PageHeader } from "@/components/ui";
import { formatSlot } from "@/lib/booking/format";
import type { AppointmentWithTherapy } from "@/lib/db/types";
import { ROUTES } from "@/lib/routes";

/** Confirms a booking back to the agent, with its reference. */
export function BookingConfirmationPage({
  appointment,
}: {
  appointment: AppointmentWithTherapy;
}) {
  const details = [
    { term: "Therapy", value: appointment.therapy.name },
    { term: "When", value: formatSlot(appointment.startsAt) },
    { term: "Length", value: `${appointment.therapy.durationMinutes} min` },
    { term: "Name", value: appointment.agentName },
    { term: "Email", value: appointment.agentEmail },
    { term: "Reference", value: appointment.reference },
  ];

  return (
    <div className="mx-auto w-full max-w-xl">
      <PageHeader
        title="You’re booked"
        lead={`See you soon, ${appointment.agentName}. Keep your reference handy.`}
      />
      <dl className="mt-8 divide-y divide-line card">
        {details.map(({ term, value }) => (
          <div
            key={term}
            className="grid gap-1 px-5 py-3 sm:grid-cols-3 sm:gap-4"
          >
            <dt className="text-sm font-medium text-muted">{term}</dt>
            <dd className="font-medium sm:col-span-2">{value}</dd>
          </div>
        ))}
      </dl>
      <ArrowLink href={ROUTES.ailments} className="mt-6">
        Browse more ailments
      </ArrowLink>
    </div>
  );
}
