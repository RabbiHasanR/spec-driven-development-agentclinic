import { ROUTES } from "@/lib/routes";
import { NotFoundPage } from "@/views/not-found/not-found-page";

export default function NotFound() {
  return (
    <NotFoundPage
      title="Ailment not found"
      message="No ailment has that address. It may have been deleted."
      backHref={ROUTES.catalog}
      backLabel="Catalog"
    />
  );
}
