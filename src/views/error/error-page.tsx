import { Button, PageHeader } from "@/components/ui";

/** Fallback for unexpected errors; server details stay in the server logs. */
export function ErrorPage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full text-center">
      <PageHeader
        title="Something went wrong"
        lead="The clinic hit a snag loading this page. Please try again."
        centered
      />
      <Button onClick={onRetry} className="mt-6">
        Try again
      </Button>
    </div>
  );
}
