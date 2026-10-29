import { StatusActions, StatusBadge } from "@/components/dashboard";
import { BackLink, DetailList, PageHeader, Section } from "@/components/ui";
import { formatSlot } from "@/lib/booking/format";
import type { StatusAction } from "@/lib/booking/form-state";
import { STATUS_LABELS, type StatusChange } from "@/lib/booking/status";
import type { AppointmentWithTherapy } from "@/lib/db/types";
import { ROUTES } from "@/lib/routes";

/** One booking for staff: its details, status, and the changes allowed now. */
export function StaffBookingPage({
  appointment,
  allowed,
  action,
}: {
  appointment: AppointmentWithTherapy;
  allowed: StatusChange[];
  action: StatusAction;
}) {
  const details = [
    { term: "Status", value: <StatusBadge status={appointment.status} /> },
    { term: "Therapy", value: appointment.therapy.name },
    { term: "When", value: formatSlot(appointment.startsAt) },
    { term: "Length", value: `${appointment.therapy.durationMinutes} min` },
    { term: "Agent", value: appointment.agentName },
    { term: "Email", value: appointment.agentEmail },
  ];

  return (
    <div className="mx-auto w-full max-w-xl">
      <BackLink href={ROUTES.dashboard} label="Dashboard" />
      <div className="mt-2">
        <PageHeader
          title={`Booking ${appointment.reference}`}
          lead={`${appointment.agentName} · ${appointment.therapy.name}`}
        />
      </div>
      <DetailList details={details} className="mt-8" />
      <Section id="status" title="Update status" className="mt-8">
        {allowed.length > 0 ? (
          <StatusActions action={action} allowed={allowed} />
        ) : (
          <p className="text-muted">
            This booking is {STATUS_LABELS[appointment.status].toLowerCase()};
            no further changes.
          </p>
        )}
      </Section>
    </div>
  );
}
