import { defineType, defineField } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 5,
      description:
        "The quote itself — no surrounding quotation marks, those are added by the component.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "person",
      title: "Person",
      type: "reference",
      to: [{ type: "person" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "role",
      title: "Role at the time",
      type: "string",
      description:
        "Title the person held during the engagement, e.g. 'Co-founder', 'Steward'.",
    }),
    defineField({
      name: "project",
      title: "Project",
      type: "reference",
      to: [{ type: "project" }],
      description:
        "Optional — link to the case study this testimonial relates to.",
    }),
    defineField({
      name: "projectLabel",
      title: "Project label (override)",
      type: "string",
      description:
        "Shown next to the role. Defaults to the linked project's name. Use this when the engagement wasn't a case-study project (e.g. 'Open Collective, Commons Hub BXL').",
    }),
    defineField({
      name: "featured",
      title: "Featured on homepage?",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "sortOrder",
      title: "Sort order",
      type: "number",
      description: "Lower numbers appear first. Default: 100.",
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: "Sort order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      name: "person.name",
      subtitle: "quote",
      media: "person.image",
    },
    prepare: ({ name, subtitle, media }) => ({
      title: name || "(no person linked)",
      subtitle: typeof subtitle === "string" ? subtitle.slice(0, 80) : "",
      media,
    }),
  },
});
