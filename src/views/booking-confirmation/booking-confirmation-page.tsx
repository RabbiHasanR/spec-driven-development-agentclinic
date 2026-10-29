import { ArrowLink, DetailList, PageHeader } from "@/components/ui";
import { formatSlot } from "@/lib/booking/format";
import { STATUS_LABELS } from "@/lib/booking/status";
import type { AppointmentWithTherapy } from "@/lib/db/types";
import { ROUTES } from "@/lib/routes";

/**
 * Confirms a booking back to the agent, with its reference. If staff have
 * since cancelled it, says so instead.
 */
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
    { term: "Status", value: STATUS_LABELS[appointment.status] },
  ];
  const cancelled = appointment.status === "cancelled";

  return (
    <div className="mx-auto w-full max-w-xl">
      {cancelled ? (
        <PageHeader
          title="Booking cancelled"
          lead={`Sorry, ${appointment.agentName}: the clinic cancelled this appointment. You’re welcome to book another time.`}
        />
      ) : (
        <PageHeader
          title="You’re booked"
          lead={`See you soon, ${appointment.agentName}. Keep your reference handy.`}
        />
      )}
      <DetailList details={details} className="mt-8" />
      <ArrowLink href={ROUTES.ailments} className="mt-6">
        {cancelled ? "Find another time" : "Browse more ailments"}
      </ArrowLink>
    </div>
  );
}
