"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import { ErrorPage } from "@/views/error/error-page";

export default function Error({
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
