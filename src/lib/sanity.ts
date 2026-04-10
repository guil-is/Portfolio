import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = "2024-01-01";

const baseClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

// Wrap the client's fetch with a 3-second timeout so builds don't hang
// when the Sanity API is unreachable (e.g. in sandboxed environments).
// Falls through to the catch in each query helper, which returns the
// local TS fallback data instead.
export const sanityClient = {
  fetch: async <T>(
    query: string,
    params?: Record<string, unknown>,
  ): Promise<T> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      const result = await baseClient.fetch<T>(query, params ?? {}, {
        signal: controller.signal,
      } as Record<string, unknown>);
      return result;
    } finally {
      clearTimeout(timeout);
    }
  },
};

const builder = imageUrlBuilder(baseClient);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
