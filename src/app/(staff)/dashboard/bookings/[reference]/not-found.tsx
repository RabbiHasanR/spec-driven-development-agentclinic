import { ROUTES } from "@/lib/routes";
import { NotFoundPage } from "@/views/not-found/not-found-page";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Booking not found"
      message="No booking has that reference. It may have been mistyped."
      backHref={ROUTES.dashboard}
      backLabel="Dashboard"
    />
  );
}
