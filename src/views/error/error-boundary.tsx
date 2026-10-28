"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import { ErrorPage } from "./error-page";

/** Route-group error boundary: logs the error and offers a retry. */
export function ErrorBoundary({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorPage onRetry={retry} />;
}
