import type { Metadata } from "next";
import { connection } from "next/server";
import { requireStaff } from "@/lib/auth/staff";
import { listAilments } from "@/lib/db/ailments";
import { getDb } from "@/lib/db/client";
import { listTherapies } from "@/lib/db/therapies";
import { StaffCatalogPage } from "@/views/staff-catalog/staff-catalog-page";

export const metadata: Metadata = {
  title: "Catalog",
  robots: { index: false },
};

export default async function Page() {
  await requireStaff();
  await connection();
  const db = getDb();
  return (
    <StaffCatalogPage
      ailments={listAilments(db)}
      therapies={listTherapies(db)}
    />
  );
}
