import { BookingForm } from "@/components/booking";
import { BackLink, PageHeader } from "@/components/ui";
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
      <section aria-labelledby="booking" className="mt-8 card p-5 sm:p-6">
        <h2 id="booking" className="text-xl font-semibold">
          Your appointment
        </h2>
        {slots.length > 0 ? (
          <div className="mt-4">
            <BookingForm action={action} slotDays={groupSlotsByDay(slots)} />
          </div>
        ) : (
          <p className="mt-4 text-muted">
            No open times in the next {BOOKING_WINDOW_DAYS} days. Please check
            back soon.
          </p>
        )}
      </section>
    </div>
  );
}
