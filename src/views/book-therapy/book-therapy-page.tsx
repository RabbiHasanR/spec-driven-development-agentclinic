import { BookingForm } from "@/components/booking";
import { BackLink, PageHeader, Section } from "@/components/ui";
import { groupSlotsByDay } from "@/lib/booking/format";
import type { BookingAction } from "@/lib/booking/form-state";
import { BOOKING_WINDOW_DAYS } from "@/lib/booking/schedule";
import type { Therapy } from "@/lib/db/types";
import { ROUTES } from "@/lib/routes";

/** Booking page for one therapy: open slots and the agent's details. */
export function BookTherapyPage({
  therapy,
  slots,
  action,
}: {
  therapy: Therapy;
  slots: string[];
  action: BookingAction;
}) {
  return (
    <div className="w-full">
      <BackLink href={ROUTES.ailments} label="Browse ailments" />
      <div className="mt-2">
        <PageHeader title={`Book ${therapy.name}`} lead={therapy.summary} />
        <p className="mt-2 text-sm font-medium text-accent">
          {therapy.durationMinutes} min session
        </p>
      </div>
      <Section
        id="booking"
        title="Your appointment"
        className="mt-8 card p-5 sm:p-6"
      >
        {slots.length > 0 ? (
          <BookingForm action={action} slotDays={groupSlotsByDay(slots)} />
        ) : (
          <p className="text-muted">
            No open times in the next {BOOKING_WINDOW_DAYS} days. Please check
            back soon.
          </p>
        )}
      </Section>
    </div>
  );
}
