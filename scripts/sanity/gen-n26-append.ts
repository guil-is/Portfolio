#!/usr/bin/env tsx
/**
 * One-off: parse Metal + Spaces content from local TS, produce
 * a JSON array of blocks to append to the n26-product-videos doc.
 */
import { htmlToBlocks } from "@sanity/block-tools";
import { Schema } from "@sanity/schema";
import { JSDOM } from "jsdom";
import { writeFileSync } from "node:fs";
import { pastProjects } from "../../src/content/projects";

const schema = Schema.compile({
  name: "default",
  types: [{
    type: "object",
    name: "doc",
    fields: [{
      name: "body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", fields: [{ name: "caption", type: "string" }] },
        { type: "object", name: "videoEmbed", fields: [
          { name: "url", type: "url" },
          { name: "caption", type: "string" },
        ]},
      ],
    }],
  }],
});

const blockContentType = (schema as any).get("doc").fields.find((f: any) => f.name === "body").type;

function normalizeEmbedUrl(src: string): string {
  try {
    const u = new URL(src);
    const yt = u.pathname.match(/^\/embed\/([A-Za-z0-9_-]+)/);
    if (u.hostname.includes("youtube.com") && yt) return `https://www.youtube.com/watch?v=${yt[1]}`;
    const vm = u.pathname.match(/^\/video\/(\d+)/);
    if (u.hostname.includes("vimeo.com") && vm) return `https://vimeo.com/${vm[1]}`;
    return src;
  } catch { return src; }
}

function parseHtml(html: string): unknown[] {
  const rules = [
    {
      deserialize(el: Element, _next: unknown, block: (b: object) => object) {
        if (el.tagName?.toLowerCase() !== "figure") return undefined;
        const iframe = el.querySelector("iframe");
        if (!iframe) return undefined;
        const src = iframe.getAttribute("src");
        if (!src) return undefined;
        return block({ _type: "videoEmbed", url: normalizeEmbedUrl(src) });
      },
    },
    {
      deserialize(el: Element, _next: unknown, block: (b: object) => object) {
        if (el.tagName?.toLowerCase() !== "figure") return undefined;
        const img = el.querySelector("img");
        if (!img) return undefined;
        const src = img.getAttribute("src");
        if (!src) return undefined;
        const rawAlt = img.getAttribute("alt");
        const caption = rawAlt && rawAlt !== "__wf_reserved_inherit" ? rawAlt : undefined;
        return block({ _type: "image", _sanityAsset: `image@${src}`, ...(caption ? { caption } : {}) });
      },
    },
  ];

  return htmlToBlocks(html, blockContentType as any, {
    parseHtml: (h: string) => new JSDOM(h).window.document,
    rules: rules as any,
  } as any) as unknown[];
}

function makeKey() {
  return `n26-${Math.random().toString(36).slice(2, 10)}`;
}

function headingBlock(text: string): unknown {
  return {
    _type: "block",
    _key: makeKey(),
    style: "h3",
    children: [{ _type: "span", _key: makeKey(), text, marks: [] }],
    markDefs: [],
  };
}

function videoBlock(url: string, caption?: string): unknown {
  return {
    _type: "videoEmbed",
    _key: makeKey(),
    url,
    ...(caption ? { caption } : {}),
  };
}

// ── Build the append payload ─────────────────────────────────────
const metal = pastProjects.find(p => p.slug === "metal")!;
const spaces = pastProjects.find(p => p.slug === "n26-spaces")!;

const appendBlocks: unknown[] = [];

// Metal section
appendBlocks.push(headingBlock("N26 Metal"));

if (metal.heroVideo) {
  appendBlocks.push(videoBlock(metal.heroVideo, "N26 Metal — hero video"));
}

if (metal.projectDetails) {
  const parsed = parseHtml(metal.projectDetails);
  for (const b of parsed) {
    const block = b as Record<string, unknown>;
    if (!block._key) block._key = makeKey();
    // Skip image blocks with _sanityAsset (can't upload from here)
    if (block._type === "image" && block._sanityAsset) continue;
    appendBlocks.push(block);
  }
}

// Spaces section
appendBlocks.push(headingBlock("N26 Spaces"));

if (spaces.heroVideo) {
  appendBlocks.push(videoBlock(spaces.heroVideo, "N26 Spaces — hero video"));
}

if (spaces.projectDetails) {
  const parsed = parseHtml(spaces.projectDetails);
  for (const b of parsed) {
    const block = b as Record<string, unknown>;
    if (!block._key) block._key = makeKey();
    if (block._type === "image" && block._sanityAsset) continue;
    appendBlocks.push(block);
  }
}

console.log(`Generated ${appendBlocks.length} blocks to append`);
const counts: Record<string, number> = {};
for (const b of appendBlocks as Array<Record<string, unknown>>) {
  const t = b._type as string;
  counts[t] = (counts[t] ?? 0) + 1;
}
console.log("Type counts:", counts);

writeFileSync(
  "scripts/sanity/n26-append-blocks.json",
  JSON.stringify(appendBlocks, null, 2),
);
console.log("Written to scripts/sanity/n26-append-blocks.json");
