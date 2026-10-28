import { ROUTES } from "@/lib/routes";
import { NotFoundPage } from "@/views/not-found/not-found-page";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Ailment not found"
      message="We couldn’t find that ailment. It may have been renamed or never existed."
      backHref={ROUTES.ailments}
      backLabel="All ailments"
    />
  );
}
