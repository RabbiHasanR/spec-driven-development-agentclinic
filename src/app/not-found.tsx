import type { Metadata } from "next";
import { MainLayout } from "@/components/layout";
import { ROUTES } from "@/lib/routes";
import { NotFoundPage } from "@/views/not-found/not-found-page";

export const metadata: Metadata = { title: "Page not found" };

// Unmatched URLs render here, inside the root layout only, so add the shell.
export default function NotFound() {
  return (
    <MainLayout>
      <NotFoundPage
        title="Page not found"
        message="There’s nothing at this address."
        backHref={ROUTES.home}
        backLabel="Home"
      />
    </MainLayout>
  );
}
