/**
 * Design resources library — shared taxonomy + helpers.
 *
 * Entries live in Sanity (the `resource` doc type, managed at /studio).
 * This module only holds the category list and pure helpers so the
 * Studio schema and the /resources page agree on one taxonomy.
 *
 * To add a category: append to RESOURCE_CATEGORIES. Order here is the
 * order groups render on the page. Never change an existing `value` —
 * documents in Sanity store it verbatim.
 */

export const RESOURCE_CATEGORIES = [
  { value: "typography", title: "Typography" },
  { value: "color", title: "Color" },
  { value: "icons-illustration", title: "Icons & Illustration" },
  { value: "inspiration", title: "Inspiration" },
  { value: "ui-kits", title: "UI kits & Components" },
  { value: "mockups-stock", title: "Mockups & Stock" },
  { value: "motion-video", title: "Motion & Video" },
  { value: "ai", title: "AI tools" },
  { value: "tools-plugins", title: "Tools & Plugins" },
  { value: "reading", title: "Reading & Learning" },
  { value: "reference", title: "Reference & Directories" },
  { value: "other", title: "Other" },
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number]["value"];

export const RESOURCE_CATEGORY_VALUES: readonly string[] = RESOURCE_CATEGORIES.map(
  (c) => c.value,
);

export function isResourceCategory(value: string): value is ResourceCategory {
  return RESOURCE_CATEGORY_VALUES.includes(value);
}

/** Display title for a stored category value. Unknown values fall back to "Other". */
export function resourceCategoryTitle(value: string): string {
  return (
    RESOURCE_CATEGORIES.find((c) => c.value === value)?.title ??
    RESOURCE_CATEGORIES[RESOURCE_CATEGORIES.length - 1].title
  );
}

/** "https://www.fonts.google.com/specimen/Inter" → "fonts.google.com" */
export function resourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
