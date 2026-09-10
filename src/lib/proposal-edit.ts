/**
 * Shared bits of the proposal page's owner edit mode.
 *
 * The page (src/app/for/[slug]/page.tsx) walks the Proposal object into a
 * flat list of string leaves and hands it to <ProposalEditor>. In edit
 * mode the editor matches those leaves to the text nodes on the page,
 * makes them contenteditable, and on save posts {old, new} pairs to
 * /api/proposal-edit, which rewrites the quoted literals in
 * src/content/proposals/<slug>.tsx through the GitHub contents API and
 * commits to main. No parser: the data files are plain object literals
 * with double-quoted strings, so a string leaf is exactly
 * JSON.stringify(value) in the source. Duplicates (the same line in two
 * quote cards) are told apart by occurrence index, counted in leaf
 * order, which is source order.
 */

export type ProposalLeaf = { path: string; value: string };

export type ProposalEdit = {
  path: string;
  old: string;
  next: string;
  /** Index of this leaf among leaves with the same `old` value. */
  occurrence: number;
};

/** Keys whose strings are not copy: links, ids, file paths, enums. */
const SKIP_KEYS = new Set([
  "slug",
  "password",
  "defaultTheme",
  "ctaHref",
  "url",
  "videoSrc",
  "poster",
  "icon",
  "kind",
  "galleryFolder",
  "mediaHref",
  "mediaLinks",
  "loomUrl",
  "src",
  "metadata",
]);

/** Every visible string in a proposal, in source order. */
export function collectLeaves(
  value: unknown,
  path = "",
  out: ProposalLeaf[] = [],
): ProposalLeaf[] {
  if (typeof value === "string") {
    if (value.trim()) out.push({ path, value });
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => collectLeaves(v, `${path}[${i}]`, out));
    return out;
  }
  if (value && typeof value === "object") {
    // React elements (JSX copy with inline links) are not editable.
    if ("$$typeof" in value) return out;
    for (const [k, v] of Object.entries(value)) {
      if (SKIP_KEYS.has(k)) continue;
      collectLeaves(v, path ? `${path}.${k}` : k, out);
    }
  }
  return out;
}

/** Whitespace-insensitive comparison key for matching DOM text to leaves. */
export function normalizeText(s: string): string {
  return s.replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

/** Occurrence index of each leaf among leaves that share its value. */
export function occurrenceOf(leaves: ProposalLeaf[], index: number): number {
  const value = leaves[index]!.value;
  let n = 0;
  for (let i = 0; i < index; i++) if (leaves[i]!.value === value) n++;
  return n;
}

function nthIndexOf(haystack: string, needle: string, n: number): number {
  let from = 0;
  for (let i = 0; ; i++) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return -1;
    if (i === n) return at;
    from = at + needle.length;
  }
}

/**
 * Rewrite the quoted literals in a proposal source file. Edits that share
 * an `old` value are applied highest occurrence first so the indices of
 * the earlier ones stay valid. Returns the edits it could not place.
 */
export function applyEdits(
  source: string,
  edits: ProposalEdit[],
): { source: string; failed: ProposalEdit[] } {
  const failed: ProposalEdit[] = [];
  const ordered = [...edits].sort((a, b) =>
    a.old === b.old ? b.occurrence - a.occurrence : 0,
  );
  let out = source;
  for (const edit of ordered) {
    const literal = JSON.stringify(edit.old);
    const at = nthIndexOf(out, literal, edit.occurrence);
    if (at === -1) {
      failed.push(edit);
      continue;
    }
    out =
      out.slice(0, at) + JSON.stringify(edit.next) + out.slice(at + literal.length);
  }
  return { source: out, failed };
}
