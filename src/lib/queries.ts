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
  /** Resolved via asset->metadata.dimensions in the GROQ query. */
  width?: number;
  height?: number;
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

export type SanityProjectTeamMember = {
  _id: string;
  /** Discriminator — whether this row points at a `person` or a `client` doc. */
  kind: "person" | "organization";
  name: string;
  slug?: string;
  link?: string;
  image?: string;
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
  isActiveProject?: boolean;
  sortOrder: number;
  date?: string;
  team?: SanityProjectTeamMember[];
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
      isActiveProject,
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
      date,
      "gridImage": gridImage.asset->url,
      "mainImage": mainImage.asset->url,
      "team": team[]->{
        _id,
        "kind": select(_type == "person" => "person", "organization"),
        name,
        "slug": slug.current,
        "link": select(_type == "person" => link, href),
        "image": select(
          _type == "person" => image.asset->url,
          logo.asset->url
        )
      },
      projectDetails[] {
        ...,
        _type == "image" => {
          ...,
          "url": asset->url
        }
      },
      stillFrames[] {
        ...,
        "url": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
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
  activeRole?: string;
  activeBlurb?: string;
  link?: string;
  gridImage?: string;
  /** True when the project has body content in `projectDetails`, i.e.
   * the case study page at /projects/<slug> has something to show. */
  hasCaseStudy?: boolean;
};

export async function getActiveProjects(): Promise<SanityActiveProject[]> {
  return sanityClient.fetch(
    `*[_type == "project" && isActiveProject == true] | order(sortOrder asc) {
      _id,
      name,
      "slug": slug.current,
      activeRole,
      activeBlurb,
      link,
      "gridImage": gridImage.asset->url,
      "hasCaseStudy": count(projectDetails) > 0
    }`,
  );
}

// ---- People ----

export type SanityPersonOrg = {
  _id: string;
  name: string;
  href?: string;
};

export type SanityPerson = {
  _id: string;
  name: string;
  slug: string;
  tags?: string[];
  link?: string;
  bio?: string;
  image?: string;
  organizations?: SanityPersonOrg[];
};

export async function getAllPeople(): Promise<SanityPerson[]> {
  return sanityClient.fetch(
    `*[_type == "person"] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      tags,
      link,
      bio,
      "image": image.asset->url,
      "organizations": organizations[]->{ _id, name, href }
    }`,
  );
}

// ---- Testimonials ----

export type SanityTestimonial = {
  _id: string;
  quote: string;
  role?: string;
  project?: string;
  projectHref?: string;
  featured?: boolean;
  person: {
    _id: string;
    name: string;
    slug: string;
    link?: string;
    image?: string;
  };
};

/**
 * Flatten a Sanity testimonial into the shape the <Testimonials>
 * component renders. Infers a twitter/linkedin platform from
 * `person.link` so a single field drives both the inline name link
 * and the avatar overlay.
 */
export function flattenTestimonial(t: SanityTestimonial): {
  quote: string;
  name: string;
  role: string;
  project: string;
  projectHref?: string;
  social?: { platform: "twitter" | "linkedin"; url: string };
  avatarUrl?: string;
  initials: string;
} {
  const { person, quote, role, project, projectHref } = t;
  const initials = person.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  let social: { platform: "twitter" | "linkedin"; url: string } | undefined;
  if (person.link) {
    const platform = /linkedin\.com/i.test(person.link)
      ? "linkedin"
      : /twitter\.com|x\.com/i.test(person.link)
        ? "twitter"
        : undefined;
    if (platform) social = { platform, url: person.link };
  }
  return {
    quote,
    name: person.name,
    role: role ?? "",
    project: project ?? "",
    projectHref,
    social,
    avatarUrl: person.image,
    initials,
  };
}

export async function getAllTestimonials(): Promise<SanityTestimonial[]> {
  return sanityClient.fetch(
    `*[_type == "testimonial"] | order(sortOrder asc) {
      _id,
      quote,
      role,
      featured,
      "project": coalesce(organization->name, project->name, projectLabel),
      "projectHref": select(
        defined(organization->href) => organization->href,
        defined(project->slug.current) => "/projects/" + project->slug.current,
        null
      ),
      "person": person->{
        _id,
        name,
        "slug": slug.current,
        link,
        "image": image.asset->url
      }
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
