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
      name: "organization",
      title: "Organization",
      type: "reference",
      to: [{ type: "client" }],
      description:
        "Org / team this testimonial was given on behalf of. Drives the subtitle shown on the card.",
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
      title: "Subtitle override",
      type: "string",
      description:
        "Free-form subtitle. Only used when neither Organization nor Project is set.",
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
