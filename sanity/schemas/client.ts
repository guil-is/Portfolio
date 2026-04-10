import { defineType, defineField } from "sanity";

export const client = defineType({
  name: "client",
  title: "Client / Partner",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "One-liner",
      type: "string",
      description: "Short description shown on the /clients page",
    }),
    defineField({
      name: "href",
      title: "Website URL",
      type: "url",
    }),
    defineField({
      name: "logo",
      title: "Logo (SVG)",
      type: "image",
      description: "Used in the marquee on the homepage if featured",
    }),
    defineField({
      name: "featured",
      title: "Show in homepage marquee?",
      type: "boolean",
      initialValue: false,
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
    select: { title: "name", subtitle: "description" },
  },
});
