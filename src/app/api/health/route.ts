import { connection } from "next/server";
import { getDb } from "@/lib/db/client";
import { pingDb } from "@/lib/db/health";

// Never cached: a health check must reflect this moment.
const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Liveness and readiness for load balancers and Docker's HEALTHCHECK: 200
 * when the database answers, 503 when it doesn't (missing file, bad
 * DATABASE_URL, locked or corrupt database). The reason stays in the logs.
 */
export async function GET(): Promise<Response> {
  await connection();
  try {
    pingDb(getDb());
    return Response.json({ status: "ok" }, { headers: NO_STORE });
  } catch (error) {
    console.error("Health check failed:", error);
    return Response.json(
      { status: "unavailable" },
      { status: 503, headers: NO_STORE },
    );
  }
}
