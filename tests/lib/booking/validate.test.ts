import { describe, expect, it } from "vitest";
import {
  MAX_NAME_LENGTH,
  readBookingForm,
  SLOT_TAKEN_MESSAGE,
  validateBooking,
} from "@/lib/booking/validate";

const SLOT = "2026-11-02T09:00:00.000Z";
const VALID = {
  agentName: "Ada",
  agentEmail: "ada@example.com",
  startsAt: SLOT,
};

describe("validateBooking", () => {
  it("accepts valid input and trims the name and email", () => {
    expect(
      validateBooking(
        { ...VALID, agentName: "  Ada ", agentEmail: " ada@example.com " },
        [SLOT],
      ),
    ).toEqual({ ok: true, value: VALID });
  });

  it("returns one error per invalid field", () => {
    const result = validateBooking(
      { agentName: " ", agentEmail: "not-an-email", startsAt: "" },
      [SLOT],
    );

    expect(result).toEqual({
      ok: false,
      errors: {
        agentName: "Enter your name.",
        agentEmail: "Enter a valid email address, like ada@example.com.",
        startsAt: "Pick a time.",
      },
    });
  });

  it("requires an email address", () => {
    const result = validateBooking({ ...VALID, agentEmail: "" }, [SLOT]);

    expect(result.ok || result.errors.agentEmail).toBe(
      "Enter your email address.",
    );
  });

  it("rejects a name that's too long", () => {
    const result = validateBooking(
      { ...VALID, agentName: "a".repeat(MAX_NAME_LENGTH + 1) },
      [SLOT],
    );

    expect(result.ok).toBe(false);
  });

  it("rejects a slot that isn't open", () => {
    const result = validateBooking(VALID, ["2026-11-02T10:00:00.000Z"]);

    expect(result).toEqual({
      ok: false,
      errors: { startsAt: SLOT_TAKEN_MESSAGE },
    });
  });
});

describe("readBookingForm", () => {
  it("reads the booking fields, using empty strings for missing ones", () => {
    const formData = new FormData();
    formData.set("agentName", "Ada");

    expect(readBookingForm(formData)).toEqual({
      agentName: "Ada",
      agentEmail: "",
      startsAt: "",
    });
  });
});
