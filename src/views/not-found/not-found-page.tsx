import { BackLink, PageHeader } from "@/components/ui";

/** "Not found" message with a link back to a parent page. */
export function NotFoundPage({
  title,
  message,
  backHref,
  backLabel,
}: {
  title: string;
  message: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="w-full">
      <PageHeader title={title} lead={message} centered />
      <div className="mt-6 text-center">
        <BackLink href={backHref} label={backLabel} />
      </div>
    </div>
  );
}
