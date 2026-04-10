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
  projectDetails?: string;
  stillFrames?: string[];
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
      sortOrder
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
      sortOrder
    }`,
    { slug },
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
