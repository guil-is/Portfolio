import { defineType, defineField } from "sanity";

export const person = defineType({
  name: "person",
  title: "Person",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Profile Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        "Used as filters on the /people page, e.g. Design, Engineering, Founder.",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "url",
      description:
        "Personal website, Twitter, LinkedIn, etc. When set, the name on /people reveals an arrow on hover.",
      validation: (r) =>
        r.uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "bio",
      title: "Short bio",
      type: "text",
      rows: 3,
      description: "Optional, not shown on the grid but available for refs.",
    }),
  ],
  orderings: [
    {
      title: "Name A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "tags", media: "image" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: Array.isArray(subtitle) ? subtitle.join(", ") : subtitle,
      media,
    }),
  },
});
