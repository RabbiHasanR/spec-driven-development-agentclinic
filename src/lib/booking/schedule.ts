// Clinic schedule rules. Slots are generated from these, never stored.

/** The clinic's IANA time zone; slot hours are wall-clock times here. */
export const CLINIC_TIME_ZONE = "UTC";

/** Hour (clinic time) the first slot of a day starts. */
export const OPENING_HOUR = 9;

/** Hour (clinic time) every session must have ended by. */
export const CLOSING_HOUR = 17;

/** Days ahead of today that agents can book, today included. */
export const BOOKING_WINDOW_DAYS = 14;

/** Days the clinic is open, as `Date#getUTCDay()` numbers (Mon–Fri). */
export const CLINIC_DAYS: readonly number[] = [1, 2, 3, 4, 5];
