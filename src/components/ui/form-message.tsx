/** A problem with a whole form, announced as an alert. */
export function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg p-3 text-danger ring-1 ring-danger">
      {message}
    </p>
  );
}
