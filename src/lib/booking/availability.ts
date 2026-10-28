import { listBookedSlots } from "@/lib/db/appointments";
import type { Db } from "@/lib/db/connection";
import type { Therapy } from "@/lib/db/types";
import { generateSlots, removeBookedSlots } from "./slots";

/**
 * A therapy's bookable start times right now: its generated slots minus any
 * that overlap a booking.
 */
export function listOpenSlots(db: Db, therapy: Therapy, now: Date): string[] {
  return removeBookedSlots(
    generateSlots(now, therapy.durationMinutes),
    listBookedSlots(db, therapy.id),
    therapy.durationMinutes,
  );
}
