import { ROUTES } from "@/lib/routes";
import { NotFoundPage } from "@/views/not-found/not-found-page";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Booking not found"
      message="We couldn’t find a booking with that reference. Check it and try again."
      backHref={ROUTES.ailments}
      backLabel="Browse ailments"
    />
  );
}
