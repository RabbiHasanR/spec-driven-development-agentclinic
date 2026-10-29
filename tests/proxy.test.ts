// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_COOKIE, signSession } from "@/lib/auth/session";
import { config, proxy } from "@/proxy";
import { AUTH_CONFIG, stubAuthEnv } from "./helpers/auth";

const ORIGIN = "http://localhost:3000";

function request(path: string, cookie?: string): NextRequest {
  const req = new NextRequest(`${ORIGIN}${path}`);
  if (cookie) req.cookies.set(SESSION_COOKIE, cookie);
  return req;
}

describe("proxy", () => {
  beforeEach(stubAuthEnv);
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("guards the dashboard and every page under it", () => {
    expect(config.matcher).toBe("/dashboard/:path*");
  });

  it("redirects a signed-out visitor to login, remembering the page", () => {
    const response = proxy(request("/dashboard/bookings/AC-1?x=1"));

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe(
      "/dashboard/bookings/AC-1?x=1",
    );
  });

  it("redirects an expired session", () => {
    const expired = signSession(new Date(Date.now() - 1000), AUTH_CONFIG);

    expect(proxy(request("/dashboard", expired)).status).toBe(307);
  });

  it("lets a signed-in staff member through", () => {
    const valid = signSession(new Date(Date.now() + 60_000), AUTH_CONFIG);
    const response = proxy(request("/dashboard", valid));

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("passes through when auth isn't configured, so the page can fail closed", () => {
    vi.stubEnv("SESSION_SECRET", "");

    expect(proxy(request("/dashboard")).headers.get("location")).toBeNull();
  });
});
