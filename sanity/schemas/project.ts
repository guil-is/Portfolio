import { defineType, defineField } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project / Case Study",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Project Name",
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
      name: "client",
      title: "Client Name",
      type: "string",
    }),
    defineField({
      name: "services",
      title: "Services Rendered",
      type: "string",
      description: "Comma-separated tags shown in the meta row",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "Large display quote shown on the project page",
    }),
    defineField({
      name: "gridImage",
      title: "Grid Thumbnail",
      type: "image",
      options: { hotspot: true },
      description: "16:9 card image used in the Past Work grid on the homepage",
    }),
    defineField({
      name: "mainImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      description: "Larger hero image for the detail page (optional, falls back to grid image)",
    }),
    defineField({
      name: "heroVideo",
      title: "Hero Video URL",
      type: "url",
      description: "YouTube or Vimeo URL. Shown instead of the hero image when set.",
    }),
    defineField({
      name: "link",
      title: "Live Website URL",
      type: "url",
    }),
    defineField({
      name: "featured",
      title: "Featured?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "projectDetails",
      title: "Project Article Body",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "caption",
              title: "Caption",
              type: "string",
            },
          ],
        },
        {
          type: "object",
          name: "videoEmbed",
          title: "Video Embed",
          fields: [
            {
              name: "url",
              title: "YouTube or Vimeo URL",
              type: "url",
              description:
                "Paste a full YouTube or Vimeo share URL. The embed is generated automatically.",
              validation: (r) =>
                r
                  .required()
                  .uri({ scheme: ["http", "https"] })
                  .custom((value: string | undefined) => {
                    if (!value) return true;
                    const ok = /youtube\.com|youtu\.be|vimeo\.com/i.test(
                      value,
                    );
                    return ok ? true : "Must be a YouTube or Vimeo URL";
                  }),
            },
            {
              name: "caption",
              title: "Caption (optional)",
              type: "string",
            },
          ],
          preview: {
            select: { title: "caption", subtitle: "url" },
            prepare: ({ title, subtitle }) => ({
              title: title || "Video embed",
              subtitle,
            }),
          },
        },
      ],
      description: "Rich text body content for the case study page",
    }),
    defineField({
      name: "stillFrames",
      title: "Still Frames",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Gallery of still-frame images",
    }),
    defineField({
      name: "sortOrder",
      title: "Sort Order",
      type: "number",
      description: "Lower numbers appear first in the grid. Default: 100.",
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: "Sort Order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "client", media: "gridImage" },
  },
});
