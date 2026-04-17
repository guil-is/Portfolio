import { sanityClient } from "./sanity";

// ---- Clients ----

export type SanityClient = {
  _id: string;
  name: string;
  description: string;
  href?: string;
  featured?: boolean;
};

export async function getAllClients(): Promise<SanityClient[]> {
  return sanityClient.fetch(
    `*[_type == "client"] | order(name asc) {
      _id, name, description, href, featured
    }`,
  );
}

export async function getFeaturedClients(): Promise<SanityClient[]> {
  return sanityClient.fetch(
    `*[_type == "client" && featured == true] | order(name asc) {
      _id, name, description, href, featured
    }`,
  );
}

// ---- Projects ----

export type SanityImageRef = {
  _type?: "image";
  _key?: string;
  url?: string;
  caption?: string;
  hotspot?: { x: number; y: number; width?: number; height?: number };
};

export type SanityVideoEmbed = {
  _type: "videoEmbed";
  _key?: string;
  url: string;
  caption?: string;
};

// Loose type for Portable Text blocks — we render via @portabletext/react
// so we don't need to model block internals strictly here.
export type PortableTextBlock = {
  _type: string;
  _key?: string;
  [key: string]: unknown;
};

export type SanityProject = {
  _id: string;
  name: string;
  slug: string;
  client: string;
  services: string;
  summary: string;
  gridImage?: string;
  mainImage?: string;
  heroVideo?: string;
  link?: string;
  featured?: boolean;
  sortOrder: number;
  /** Portable Text body. Includes block, image, and videoEmbed types. */
  projectDetails?: PortableTextBlock[];
  stillFrames?: SanityImageRef[];
};

export async function getAllProjects(): Promise<SanityProject[]> {
  return sanityClient.fetch(
    `*[_type == "project"] | order(sortOrder asc) {
      _id,
      name,
      "slug": slug.current,
      client,
      services,
      summary,
      heroVideo,
      link,
      featured,
      sortOrder,
      "gridImage": gridImage.asset->url,
      "mainImage": mainImage.asset->url
    }`,
  );
}

export async function getProjectBySlug(
  slug: string,
): Promise<SanityProject | null> {
  return sanityClient.fetch(
    `*[_type == "project" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      client,
      services,
      summary,
      heroVideo,
      link,
      featured,
      sortOrder,
      "gridImage": gridImage.asset->url,
      "mainImage": mainImage.asset->url,
      projectDetails[] {
        ...,
        _type == "image" => {
          ...,
          "url": asset->url
        }
      },
      stillFrames[] {
        ...,
        "url": asset->url
      }
    }`,
    { slug },
  );
}

export async function getAllProjectSlugs(): Promise<string[]> {
  return sanityClient.fetch(
    `*[_type == "project"].slug.current`,
  );
}

// ---- Active Projects ----

export type SanityActiveProject = {
  _id: string;
  name: string;
  slug: string;
  client: string;
  services: string;
  summary: string;
  heroVideo?: string;
  link?: string;
  gridImage?: string;
  mainImage?: string;
};

export async function getActiveProjects(): Promise<SanityActiveProject[]> {
  return sanityClient.fetch(
    `*[_type == "project" && featured == true] | order(sortOrder asc) [0...4] {
      _id,
      name,
      "slug": slug.current,
      client,
      services,
      summary,
      heroVideo,
      link,
      "gridImage": gridImage.asset->url,
      "mainImage": mainImage.asset->url
    }`,
  );
}

// ---- Site Settings ----

export type SanitySettings = {
  headline?: string;
  bio?: string[];
  bioClosing?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bottomCtaHeading?: string;
  bottomCtaSub?: string;
};

export async function getSiteSettings(): Promise<SanitySettings | null> {
  return sanityClient.fetch(
    `*[_type == "siteSettings"][0] {
      headline, bio, bioClosing, ctaLabel, ctaHref,
      bottomCtaHeading, bottomCtaSub
    }`,
  );
}
