import { createClient } from "next-sanity";
import { projectId, dataset } from "./sanity";

/**
 * Server-only Sanity client authorized for writes (create / patch /
 * delete). Kept separate from the read-only `sanityClient` so that:
 *
 *   • Write access is explicit — code that mutates data must import
 *     from here, making it easy to audit.
 *   • The token never reaches the browser bundle. `SANITY_AUTH_TOKEN`
 *     has no NEXT_PUBLIC_ prefix, so it stays server-side only.
 *   • `useCdn: false` — mutations must hit the live API, not the CDN.
 *
 * Throws on import if the token isn't set, which is intentional:
 * calling code will fail fast rather than silently corrupt data.
 */

const apiVersion = "2024-01-01";

const token = process.env.SANITY_AUTH_TOKEN;

function assertToken(value: string | undefined): string {
  if (!value) {
    throw new Error(
      "SANITY_AUTH_TOKEN is not set. Add it to .env.local to enable Sanity writes.",
    );
  }
  return value;
}

export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: assertToken(token),
  useCdn: false,
  perspective: "published",
});
