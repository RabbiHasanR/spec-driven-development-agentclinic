/** The fields an agent submits on the booking form. */
export type BookingInput = {
  agentName: string;
  agentEmail: string;
  startsAt: string;
};

export type BookingFieldErrors = Partial<Record<keyof BookingInput, string>>;

export type BookingValidation =
  { ok: true; value: BookingInput } | { ok: false; errors: BookingFieldErrors };

export const MAX_NAME_LENGTH = 80;
export const MAX_EMAIL_LENGTH = 254;

/** Shown when the chosen slot isn't open, including when it was just taken. */
export const SLOT_TAKEN_MESSAGE =
  "That time is no longer available. Please pick another.";

// Deliberately loose: one @, a dot in the domain, no spaces.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Reads the booking fields from a submitted form; missing fields are "". */
export function readBookingForm(formData: FormData): BookingInput {
  const field = (name: keyof BookingInput) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    agentName: field("agentName"),
    agentEmail: field("agentEmail"),
    startsAt: field("startsAt"),
  };
}

/**
 * Checks a booking against the rules and the slots open right now.
 *
 * @param input - Submitted fields.
 * @param openSlots - ISO start times that are currently bookable.
 * @returns The trimmed input, or one error per invalid field.
 */
export function validateBooking(
  input: BookingInput,
  openSlots: readonly string[],
): BookingValidation {
  const value = {
    agentName: input.agentName.trim(),
    agentEmail: input.agentEmail.trim(),
    startsAt: input.startsAt,
  };
  const errors: BookingFieldErrors = {};

  if (!value.agentName) errors.agentName = "Enter your name.";
  else if (value.agentName.length > MAX_NAME_LENGTH)
    errors.agentName = `Use ${MAX_NAME_LENGTH} characters or fewer.`;

  if (!value.agentEmail) errors.agentEmail = "Enter your email address.";
  else if (
    value.agentEmail.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(value.agentEmail)
  )
    errors.agentEmail = "Enter a valid email address, like ada@example.com.";

  if (!value.startsAt) errors.startsAt = "Pick a time.";
  else if (!openSlots.includes(value.startsAt))
    errors.startsAt = SLOT_TAKEN_MESSAGE;

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value };
}
