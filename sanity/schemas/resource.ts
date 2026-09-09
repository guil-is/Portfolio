import { defineType, defineField } from "sanity";
import {
  RESOURCE_CATEGORIES,
  resourceCategoryTitle,
  resourceDomain,
} from "../../src/lib/resources";

// One entry in the design resources library at /resources.
// Category values + order come from src/lib/resources.ts so the page
// and the Studio can never disagree.
export const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (r) =>
        r
          .required()
          .uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: RESOURCE_CATEGORIES.map((c) => ({
          title: c.title,
          value: c.value,
        })),
        layout: "dropdown",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Why it's here",
      type: "text",
      rows: 2,
      description: "One line. Shown under the title on /resources.",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description:
        "Free-form, lowercase. Searchable on /resources, e.g. free, variable, open-source.",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      description:
        "5 = essential, reach for it weekly · 3 = solid, one of several · 1 = niche, kept for reference. Sorts within its category.",
      options: {
        list: [
          { title: "5", value: 5 },
          { title: "4", value: 4 },
          { title: "3", value: 3 },
          { title: "2", value: 2 },
          { title: "1", value: 1 },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (r) => r.integer().min(1).max(5),
    }),
  ],
  orderings: [
    {
      title: "Title A-Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
    {
      title: "Category",
      name: "category",
      by: [
        { field: "category", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
    {
      title: "Rating high-low",
      name: "ratingDesc",
      by: [
        { field: "rating", direction: "desc" },
        { field: "title", direction: "asc" },
      ],
    },
    {
      title: "Newest first",
      name: "newest",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", category: "category", url: "url", rating: "rating" },
    prepare: ({ title, category, url, rating }) => ({
      title,
      subtitle: [
        category ? resourceCategoryTitle(category) : null,
        url ? resourceDomain(url) : null,
        rating ? `${rating}/5` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
