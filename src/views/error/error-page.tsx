/** Fallback for unexpected errors; server details stay in the server logs. */
export function ErrorPage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-teal-800 dark:text-teal-300">
        Something went wrong
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        The clinic hit a snag loading this page. Please try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-teal-700 px-5 font-medium text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        Try again
      </button>
    </div>
  );
}
