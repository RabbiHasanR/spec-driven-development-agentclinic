// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../../helpers/db";

const mocks = vi.hoisted(() => ({ getDb: vi.fn() }));

vi.mock("@/lib/db/client", () => ({ getDb: mocks.getDb }));
vi.mock("next/server", () => ({ connection: async () => {} }));

const { GET } = await import("@/app/api/health/route");

describe("GET /api/health", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is ok when the database answers, and is never cached", async () => {
    mocks.getDb.mockReturnValue(createTestDb({ seed: false }));

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("is unavailable when the database can't be opened, without leaking why", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getDb.mockImplementation(() => {
      throw new Error('No database at "/secret/path.db".');
    });

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable" });
    expect(console.error).toHaveBeenCalled();
  });

  it("is unavailable when the database stops answering", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const db = createTestDb({ seed: false });
    db.$client.close();
    mocks.getDb.mockReturnValue(db);

    expect((await GET()).status).toBe(503);
  });
});
