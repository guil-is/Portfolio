import { createClient, type SanityClient } from "next-sanity";
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
 * Lazy-initialized: the token is only checked on first use, so missing
 * configuration produces a runtime error on the specific endpoint
 * that needs it — not a build failure that breaks the whole site.
 */

const apiVersion = "2024-01-01";

let cached: SanityClient | null = null;

export function getSanityWriteClient(): SanityClient {
  if (cached) return cached;
  const token = process.env.SANITY_AUTH_TOKEN;
  if (!token) {
    throw new Error(
      "SANITY_AUTH_TOKEN is not set. Add it to Vercel env vars (or .env.local) to enable Sanity writes.",
    );
  }
  cached = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: "published",
  });
  return cached;
}
