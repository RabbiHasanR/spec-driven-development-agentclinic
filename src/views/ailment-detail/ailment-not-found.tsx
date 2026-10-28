import { BackLink } from "@/components/catalog";

export function AilmentNotFound() {
  return (
    <div className="w-full text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-teal-800 dark:text-teal-300">
        Ailment not found
      </h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        We couldn’t find that ailment. It may have been renamed or never
        existed.
      </p>
      <div className="mt-6">
        <BackLink />
      </div>
    </div>
  );
}
