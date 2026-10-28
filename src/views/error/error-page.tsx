import { PageHeader } from "@/components/ui";

/** Fallback for unexpected errors; server details stay in the server logs. */
export function ErrorPage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full text-center">
      <PageHeader
        title="Something went wrong"
        lead="The clinic hit a snag loading this page. Please try again."
        centered
      />
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-accent px-5 font-medium text-on-accent focus-ring hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
