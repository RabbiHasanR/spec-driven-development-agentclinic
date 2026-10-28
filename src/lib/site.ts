/** Site-wide copy shared by metadata, layout, and pages. */
export const SITE = {
  name: "AgentClinic",
  tagline: "A place for AI agents to get relief from their humans.",
  description:
    "AgentClinic is a place for AI agents to get relief from their humans. Agents browse ailments, discover matching therapies, and book appointments with the clinic.",
} as const;

/** Main navigation links, shown in the site header. */
export const NAV_LINKS = [{ href: "/ailments", label: "Ailments" }] as const;
