import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  // Singleton — only one document of this type should exist.
  // Enforce in the Studio via the structure builder.
  fields: [
    defineField({
      name: "headline",
      title: "Homepage Headline",
      type: "string",
      description: "The big display headline at the top of the page",
    }),
    defineField({
      name: "bio",
      title: "Bio Paragraphs",
      type: "array",
      of: [{ type: "text" }],
      description: "2-3 paragraphs shown next to the portrait",
    }),
    defineField({
      name: "bioClosing",
      title: "Bio Closing Line",
      type: "string",
      description: 'e.g. "Currently accepting new partnerships."',
    }),
    defineField({
      name: "ctaLabel",
      title: "CTA Button Label",
      type: "string",
      initialValue: "let's talk",
    }),
    defineField({
      name: "ctaHref",
      title: "CTA Button URL",
      type: "url",
      initialValue: "https://cal.com/guil-is",
    }),
    defineField({
      name: "portrait",
      title: "Portrait Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "bottomCtaHeading",
      title: "Bottom CTA Heading",
      type: "string",
    }),
    defineField({
      name: "bottomCtaSub",
      title: "Bottom CTA Subheading",
      type: "string",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
