import Link from "next/link";
import { ArrowLink, BackLink, PageHeader, Section } from "@/components/ui";
import type { Ailment, Therapy } from "@/lib/db/types";
import { editAilmentPath, editTherapyPath, ROUTES } from "@/lib/routes";

type Entry = { id: number; name: string; detail: string; editHref: string };

/** Staff view of the whole catalog, with links to add and edit entries. */
export function StaffCatalogPage({
  ailments,
  therapies,
}: {
  ailments: Ailment[];
  therapies: Therapy[];
}) {
  const sections = [
    {
      id: "ailments",
      title: "Ailments",
      addHref: ROUTES.newAilment,
      addLabel: "Add an ailment",
      entries: ailments.map((a) => ({
        id: a.id,
        name: a.name,
        detail: a.summary,
        editHref: editAilmentPath(a.slug),
      })),
    },
    {
      id: "therapies",
      title: "Therapies",
      addHref: ROUTES.newTherapy,
      addLabel: "Add a therapy",
      entries: therapies.map((t) => ({
        id: t.id,
        name: t.name,
        detail: `${t.durationMinutes} min · ${t.summary}`,
        editHref: editTherapyPath(t.slug),
      })),
    },
  ];

  return (
    <div className="w-full">
      <BackLink href={ROUTES.dashboard} label="Dashboard" />
      <div className="mt-2">
        <PageHeader
          title="Catalog"
          lead="The ailments agents browse and the therapies they book."
        />
      </div>
      {sections.map(({ id, title, addHref, addLabel, entries }) => (
        <Section key={id} id={id} title={title}>
          <ArrowLink href={addHref}>{addLabel}</ArrowLink>
          {entries.length > 0 ? (
            <EntryList label={title} entries={entries} />
          ) : (
            <p className="mt-2 text-muted">None yet.</p>
          )}
        </Section>
      ))}
    </div>
  );
}

/** Entries as cards: one column on phones, two from `md` up. */
function EntryList({ label, entries }: { label: string; entries: Entry[] }) {
  return (
    <ul aria-label={label} className="mt-3 grid gap-3 md:grid-cols-2">
      {entries.map(({ id, name, detail, editHref }) => (
        <li key={id} className="flex items-start gap-3 card p-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{name}</p>
            <p className="mt-1 text-sm text-muted">{detail}</p>
          </div>
          <Link
            href={editHref}
            aria-label={`Edit ${name}`}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded font-medium text-accent focus-ring hover:underline"
          >
            Edit
          </Link>
        </li>
      ))}
    </ul>
  );
}
