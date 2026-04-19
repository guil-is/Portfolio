import { defineType, defineField } from "sanity";

/**
 * Log entry for a single proposal-page view. One document per visit.
 * Written by /api/track-visit from the <VisitTracker /> component
 * that lives inside the password-gated content of /for/[slug].
 *
 * Sessions are deduped client-side via sessionStorage, so one visit
 * per browser tab session. Reloads in the same tab don't duplicate;
 * a fresh tab tomorrow does.
 */
export const proposalVisit = defineType({
  name: "proposalVisit",
  title: "Proposal Visit",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Proposal slug",
      type: "string",
      description: "Matches the /for/<slug> URL, e.g. 'odyssey'.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "clientName",
      title: "Client name (denormalised)",
      type: "string",
      description:
        "Copy of the proposal's clientName at time of visit, so the log is readable without cross-referencing the TS content.",
    }),
    defineField({
      name: "visitedAt",
      title: "Visited at (server time)",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ipAddress",
      title: "IP address",
      type: "string",
    }),
    defineField({
      name: "userAgent",
      title: "User agent",
      type: "text",
    }),
  ],
  orderings: [
    {
      title: "Visited, newest first",
      name: "visitedAtDesc",
      by: [{ field: "visitedAt", direction: "desc" }],
    },
    {
      title: "By slug, then newest",
      name: "slugThenVisited",
      by: [
        { field: "slug", direction: "asc" },
        { field: "visitedAt", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: { slug: "slug", clientName: "clientName", visitedAt: "visitedAt" },
    prepare({ slug, clientName, visitedAt }) {
      return {
        title: clientName ? `${clientName} · /for/${slug}` : `/for/${slug}`,
        subtitle: visitedAt ? new Date(visitedAt).toLocaleString() : "",
      };
    },
  },
});
