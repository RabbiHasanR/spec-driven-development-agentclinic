// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  passwordMatches,
  readAuthConfig,
  safeNextPath,
  signSession,
  verifySession,
} from "@/lib/auth/session";
import { AUTH_CONFIG, PASSWORD, SECRET } from "../../helpers/auth";

const NOW = new Date("2026-10-29T12:00:00.000Z");
const LATER = new Date("2026-10-29T20:00:00.000Z");

describe("signSession / verifySession", () => {
  it("accepts a freshly signed, unexpired token", () => {
    expect(
      verifySession(signSession(LATER, AUTH_CONFIG), AUTH_CONFIG, NOW),
    ).toBe(true);
  });

  it("rejects an expired token", () => {
    const token = signSession(LATER, AUTH_CONFIG);
    expect(verifySession(token, AUTH_CONFIG, LATER)).toBe(false);
  });

  it("rejects a token signed with another secret", () => {
    const token = signSession(LATER, {
      ...AUTH_CONFIG,
      secret: "x".repeat(32),
    });
    expect(verifySession(token, AUTH_CONFIG, NOW)).toBe(false);
  });

  it("rejects a token signed before the password changed", () => {
    const token = signSession(LATER, AUTH_CONFIG);
    const changed = { ...AUTH_CONFIG, password: "a brand new password" };

    expect(verifySession(token, changed, NOW)).toBe(false);
  });

  it("rejects a token whose expiry was pushed back", () => {
    const [, signature] = signSession(LATER, AUTH_CONFIG).split(".");
    const forged = `${LATER.getTime() + 86_400_000}.${signature}`;
    expect(verifySession(forged, AUTH_CONFIG, NOW)).toBe(false);
  });

  it.each([undefined, "", "garbage", "1.2.3", `${LATER.getTime()}.`])(
    "rejects a malformed token (%s)",
    (token) => {
      expect(verifySession(token, AUTH_CONFIG, NOW)).toBe(false);
    },
  );
});

describe("readAuthConfig", () => {
  it("returns the password and secret when both are set", () => {
    expect(
      readAuthConfig({ STAFF_PASSWORD: PASSWORD, SESSION_SECRET: SECRET }),
    ).toEqual(AUTH_CONFIG);
  });

  it.each([
    ["no password", { SESSION_SECRET: SECRET }],
    ["no secret", { STAFF_PASSWORD: PASSWORD }],
    ["a short secret", { STAFF_PASSWORD: PASSWORD, SESSION_SECRET: "short" }],
    [
      "an 11-character password",
      { STAFF_PASSWORD: "x".repeat(11), SESSION_SECRET: SECRET },
    ],
  ])("fails closed with %s", (_case, env) => {
    expect(readAuthConfig(env)).toBeNull();
  });
});

describe("passwordMatches", () => {
  it("matches only the exact password", () => {
    expect(passwordMatches("open sesame", "open sesame")).toBe(true);
    expect(passwordMatches("open sesam", "open sesame")).toBe(false);
    expect(passwordMatches("", "open sesame")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/dashboard/bookings/AC-7F3K9Q", "/dashboard/bookings/AC-7F3K9Q"],
    ["/dashboard?tab=past", "/dashboard?tab=past"],
  ])("keeps the staff path %s", (next, expected) => {
    expect(safeNextPath(next)).toBe(expected);
  });

  it.each([
    "https://evil.example/dashboard",
    "//evil.example/dashboard",
    "/\\evil.example/dashboard",
    "/ailments",
    "/dashboard-evil",
    "/dashboard/../ailments",
    "",
    undefined,
    ["/dashboard"],
  ])("sends %s to the dashboard instead", (next) => {
    expect(safeNextPath(next)).toBe("/dashboard");
  });
});
