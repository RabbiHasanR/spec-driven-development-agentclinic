import type { Metadata } from "next";
import { connection } from "next/server";
import { listAilments } from "@/lib/db/ailments";
import { getDb } from "@/lib/db/client";
import { AilmentsPage } from "@/views/ailments/ailments-page";

export const metadata: Metadata = { title: "Ailments" };

export default async function Page() {
  // Read the catalog per request, not at build time (better-sqlite3 is sync).
  await connection();
  return <AilmentsPage ailments={listAilments(getDb())} />;
}
