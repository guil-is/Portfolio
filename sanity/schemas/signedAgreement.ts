import { defineType, defineField } from "sanity";

/**
 * Record of an electronically signed client agreement.
 *
 * One document per (clientSlug, documentVersion) signature event.
 * These are write-once: never edited, never deleted. Together with the
 * checkbox acknowledgments and server-captured metadata (IP, UA,
 * timestamp) they form the legal audit trail for the engagement.
 */
export const signedAgreement = defineType({
  name: "signedAgreement",
  title: "Signed Agreement",
  type: "document",
  fields: [
    defineField({
      name: "clientSlug",
      title: "Client slug",
      type: "string",
      description: "Matches the /for/<slug> URL, e.g. 'justice'.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "signerName",
      title: "Signer full name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "signerEmail",
      title: "Signer email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "signedAt",
      title: "Signed at (server time)",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "ipAddress",
      title: "IP address at signing",
      type: "string",
    }),
    defineField({
      name: "userAgent",
      title: "User agent at signing",
      type: "text",
    }),
    defineField({
      name: "documentVersion",
      title: "Document version",
      type: "string",
      description: "Human version tag, e.g. 'v1-2026-03-26'.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "documentHash",
      title: "Document hash (SHA-256)",
      type: "string",
      description: "Fingerprint of the exact document text the signer accepted.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "acknowledgments",
      title: "Checked acknowledgments",
      type: "array",
      of: [{ type: "string" }],
      description: "Exact wording of each checkbox the signer confirmed.",
    }),
  ],
  orderings: [
    {
      title: "Signed at, newest first",
      name: "signedAtDesc",
      by: [{ field: "signedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "signerName",
      subtitle: "clientSlug",
      date: "signedAt",
    },
    prepare({ title, subtitle, date }) {
      return {
        title: title ?? "(unsigned)",
        subtitle: date
          ? `${subtitle} · ${new Date(date).toLocaleString()}`
          : subtitle,
      };
    },
  },
});
