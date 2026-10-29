import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth/actions";
import { safeNextPath } from "@/lib/auth/session";
import { isStaffSignedIn } from "@/lib/auth/staff";
import { LoginPage } from "@/views/login/login-page";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false },
};

export default async function Page({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  // Already signed in: skip the form.
  if (await isStaffSignedIn()) redirect(safeNextPath(next));
  return (
    <LoginPage
      action={signIn}
      next={typeof next === "string" ? next : undefined}
    />
  );
}
