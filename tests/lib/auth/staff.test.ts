// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_COOKIE, signSession } from "@/lib/auth/session";
import {
  fakeCookieStore,
  SECRET,
  stubAuthEnv,
  type FakeCookieStore,
} from "../../helpers/auth";

const mocks = vi.hoisted(() => ({
  cookies: undefined as FakeCookieStore | undefined,
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => mocks.cookies }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
}));

const { isStaffSignedIn, requireStaff } = await import("@/lib/auth/staff");

const HOUR = 60 * 60 * 1000;

function signInWith(secret: string, expiresInMs = HOUR) {
  mocks.cookies!.set(
    SESSION_COOKIE,
    signSession(new Date(Date.now() + expiresInMs), secret),
  );
}

describe("staff session gate", () => {
  beforeEach(() => {
    stubAuthEnv();
    mocks.cookies = fakeCookieStore();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("lets a signed-in staff member through", async () => {
    signInWith(SECRET);

    expect(await isStaffSignedIn()).toBe(true);
    await expect(requireStaff()).resolves.toBeUndefined();
  });

  it("sends a visitor without a session to the login page", async () => {
    expect(await isStaffSignedIn()).toBe(false);
    await expect(requireStaff()).rejects.toThrow("NEXT_REDIRECT /login");
  });

  it("treats an expired or forged session as signed out", async () => {
    signInWith(SECRET, -1);
    await expect(requireStaff()).rejects.toThrow("NEXT_REDIRECT /login");

    signInWith("someone-elses-secret-that-is-32-chars");
    await expect(requireStaff()).rejects.toThrow("NEXT_REDIRECT /login");
  });

  it("fails closed when auth isn't configured", async () => {
    signInWith(SECRET);
    vi.stubEnv("STAFF_PASSWORD", "");
    const readCookie = vi.spyOn(mocks.cookies!, "get");

    // Agent pages ask quietly and carry on...
    expect(await isStaffSignedIn()).toBe(false);
    // ...staff pages refuse to render.
    await expect(requireStaff()).rejects.toThrow(
      "Staff auth is not configured",
    );
    // The cookie is still read: that marks the page request-time, so the
    // build (which has no env) never prerenders a signed-out answer.
    expect(readCookie).toHaveBeenCalledTimes(2);
  });
});
