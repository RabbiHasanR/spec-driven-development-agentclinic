import { STATUS_LABELS } from "@/lib/booking/status";
import type { AppointmentStatus } from "@/lib/db/types";

/**
 * Per-status look. Each status differs in text as well as color, so the
 * badge never relies on color alone.
 */
const STATUS_CLASS: Record<AppointmentStatus, string> = {
  booked: "text-accent ring-line-strong",
  attended: "bg-accent text-on-accent ring-accent",
  no_show: "text-danger ring-danger",
  cancelled: "text-muted ring-line line-through",
};

/** A booking's status as a small pill. */
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
