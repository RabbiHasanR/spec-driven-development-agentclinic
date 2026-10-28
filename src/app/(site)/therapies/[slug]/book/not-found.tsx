import { ROUTES } from "@/lib/routes";
import { NotFoundPage } from "@/views/not-found/not-found-page";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Therapy not found"
      message="We couldn’t find that therapy. It may have been renamed or never existed."
      backHref={ROUTES.ailments}
      backLabel="Browse ailments"
    />
  );
}
