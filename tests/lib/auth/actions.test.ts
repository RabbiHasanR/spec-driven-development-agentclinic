// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_UNAVAILABLE_MESSAGE,
  INCORRECT_PASSWORD_MESSAGE,
  INITIAL_SIGN_IN_FORM_STATE,
} from "@/lib/auth/form-state";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySession,
} from "@/lib/auth/session";
import {
  fakeCookieStore,
  PASSWORD,
  SECRET,
  stubAuthEnv,
  type FakeCookieStore,
} from "../../helpers/auth";

const mocks = vi.hoisted(() => ({
  cookies: undefined as FakeCookieStore | undefined,
}));

vi.mock("next/headers", () => ({ cookies: async () => mocks.cookies }));
vi.mock("next/navigation", () => ({
  RedirectType: { replace: "replace", push: "push" },
  redirect: (url: string, type?: string) => {
    throw new Error(["NEXT_REDIRECT", type, url].filter(Boolean).join(" "));
  },
}));

const { signIn, signOut } = await import("@/lib/auth/actions");

function form(values: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(values)) formData.set(name, value);
  return formData;
}

const submit = (values: Record<string, string>) =>
  signIn(INITIAL_SIGN_IN_FORM_STATE, form(values));

describe("signIn", () => {
  beforeEach(() => {
    stubAuthEnv();
    mocks.cookies = fakeCookieStore();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("sets a signed, httpOnly session cookie and returns to the requested page", async () => {
    const error = await submit({
      password: PASSWORD,
      next: "/dashboard/catalog",
    }).catch((e: Error) => e);

    expect(String(error)).toContain("NEXT_REDIRECT replace /dashboard/catalog");
    expect(verifySession(mocks.cookies!.session(), SECRET, new Date())).toBe(
      true,
    );
    expect(mocks.cookies!.options.get(SESSION_COOKIE)).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  });

  it.each<Record<string, string>>([
    { password: PASSWORD, next: "https://evil.example" },
    { password: PASSWORD },
  ])("goes to the dashboard when next is unsafe or missing", async (values) => {
    const error = await submit(values).catch((e: Error) => e);

    expect(String(error)).toMatch(/NEXT_REDIRECT replace \/dashboard$/);
  });

  it("rejects a wrong password without setting a cookie", async () => {
    const state = await submit({ password: "nope" });

    expect(state).toEqual({ error: INCORRECT_PASSWORD_MESSAGE });
    expect(mocks.cookies!.session()).toBeUndefined();
  });

  it("refuses to sign anyone in when auth isn't configured", async () => {
    vi.stubEnv("SESSION_SECRET", "");

    const state = await submit({ password: PASSWORD });

    expect(state).toEqual({ message: AUTH_UNAVAILABLE_MESSAGE });
    expect(mocks.cookies!.session()).toBeUndefined();
  });
});

describe("signOut", () => {
  it("clears the session cookie and goes home", async () => {
    mocks.cookies = fakeCookieStore();
    mocks.cookies.set(SESSION_COOKIE, signSession(new Date(), SECRET));

    const error = await signOut().catch((e: Error) => e);

    expect(String(error)).toContain("NEXT_REDIRECT /");
    expect(mocks.cookies.session()).toBeUndefined();
  });
});
