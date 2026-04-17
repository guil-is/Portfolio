#!/usr/bin/env tsx
/**
 * Diagnostic: runs the same HTML → Portable Text parsing the
 * migration script uses, on a specific local project's HTML, and
 * dumps the resulting block types. No Sanity I/O. Tells us whether
 * the parsing side is producing videoEmbed blocks at all.
 */
import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { JSDOM } from "jsdom";
import { pastProjects } from "../../src/content/projects";

const slug = process.env.SLUG || "the-daoist";
const local = pastProjects.find((p) => p.slug === slug);
if (!local) {
  console.error(`No local project with slug "${slug}"`);
  process.exit(1);
}
if (!local.projectDetails) {
  console.error(`Local project "${slug}" has no projectDetails`);
  process.exit(1);
}

const defaultSchema = Schema.compile({
  name: "default",
  types: [
    {
      type: "object",
      name: "projectDoc",
      fields: [
        {
          title: "Body",
          name: "body",
          type: "array",
          of: [
            { type: "block" },
            {
              type: "image",
              fields: [{ name: "caption", title: "Caption", type: "string" }],
            },
            {
              type: "object",
              name: "videoEmbed",
              fields: [
                { name: "url", title: "URL", type: "url" },
                { name: "caption", title: "Caption", type: "string" },
              ],
            },
          ],
        },
      ],
    },
  ],
});

const blockContentType = (defaultSchema as unknown as {
  get: (n: string) => { fields: Array<{ name: string; type: unknown }> };
})
  .get("projectDoc")
  .fields.find((f) => f.name === "body")!.type;

const rules = [
  {
    deserialize(el: Element, _next: unknown, block: (b: object) => object) {
      if (el.tagName?.toLowerCase() !== "figure") return undefined;
      const iframe = el.querySelector("iframe");
      if (!iframe) return undefined;
      const src = iframe.getAttribute("src");
      if (!src) return undefined;
      console.log(`  → iframe rule matched, src=${src}`);
      return block({ _type: "videoEmbed", url: src });
    },
  },
  {
    deserialize(el: Element, _next: unknown, block: (b: object) => object) {
      if (el.tagName?.toLowerCase() !== "figure") return undefined;
      const img = el.querySelector("img");
      if (!img) return undefined;
      const src = img.getAttribute("src");
      if (!src) return undefined;
      return block({ _type: "image", _sanityAsset: `image@${src}` });
    },
  },
];

console.log(`Parsing ${local.projectDetails.length} chars of HTML…`);
console.log(`HTML snippet (first 500 chars):\n${local.projectDetails.slice(0, 500)}\n`);

// Count how many <figure><iframe> occurrences are in the raw HTML
const figureIframeCount = (
  local.projectDetails.match(/<figure[^>]*>[^]*?<iframe[^>]*>/g) ?? []
).length;
console.log(`Raw HTML contains ${figureIframeCount} <figure>…<iframe> pairs\n`);

const blocks = htmlToBlocks(
  local.projectDetails,
  blockContentType as Parameters<typeof htmlToBlocks>[1],
  {
    parseHtml: (h: string) => new JSDOM(h).window.document,
    rules: rules as unknown as Parameters<typeof htmlToBlocks>[2]["rules"],
  } as Parameters<typeof htmlToBlocks>[2],
);

console.log(`\nResulting ${blocks.length} blocks:`);
const counts: Record<string, number> = {};
for (const b of blocks as Array<Record<string, unknown>>) {
  const t = (b._type as string) ?? "unknown";
  counts[t] = (counts[t] ?? 0) + 1;
  const detail =
    t === "videoEmbed"
      ? `url=${b.url}`
      : t === "image"
        ? `_sanityAsset=${(b as Record<string, unknown>)._sanityAsset ?? ""}`
        : "";
  console.log(`  _type=${t} ${detail}`);
}
console.log(`\nCounts:`, counts);
