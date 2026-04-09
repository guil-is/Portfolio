// Single source of truth for portfolio copy.
// Edit this file to update every section of the site.

export type Service = {
  title: string;
  description: string;
};

export type Project = {
  title: string;
  role: string;
  year: string;
  description: string;
  image: string;
  href?: string;
};

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

export type Social = {
  label: string;
  href: string;
};

export const site = {
  name: "Guil Maueler",
  title: "Fractional Design Partner",
  tagline:
    "Fractional Design Partner helping founders ship thoughtful 0\u20921 products.",
  email: "hello@example.com",

  about: [
    "I partner with founders and small teams to turn early ideas into products people actually want to use. My focus is on clarity, craft, and shipping \u2014 not deliverables for their own sake.",
    "Over the past several years I\u2019ve led product design work across consumer, developer tools, and AI. I like being embedded just enough to move fast with the team, and stepping back just enough to keep the long view in focus.",
  ],

  services: [
    {
      title: "Product strategy",
      description:
        "Translate a rough vision into a concrete product direction \u2014 what to build first, what to cut, and what to come back to later.",
    },
    {
      title: "Design & prototyping",
      description:
        "High\u2011fidelity interactive prototypes that feel like the real thing, so you can validate ideas with users before committing engineering cycles.",
    },
    {
      title: "Working with engineering",
      description:
        "Tight loops with your engineers \u2014 pairing on implementation, reviewing PRs, and iterating on the live product until it feels right.",
    },
    {
      title: "Design team building",
      description:
        "Hiring plans, interview loops, rituals, and early culture so your first design hires are set up to succeed.",
    },
  ] satisfies Service[],

  projects: [
    {
      title: "Project One",
      role: "Lead Designer",
      year: "2025",
      description:
        "A short placeholder description of the project \u2014 the problem, your role, and the outcome. Replace with real details.",
      image: "/projects/project-1.svg",
    },
    {
      title: "Project Two",
      role: "Design Partner",
      year: "2024",
      description:
        "Another placeholder project. Keep descriptions tight \u2014 two or three sentences is plenty.",
      image: "/projects/project-2.svg",
    },
    {
      title: "Project Three",
      role: "Product Designer",
      year: "2024",
      description:
        "One more slot. Swap these for your real selected work when you\u2019re ready.",
      image: "/projects/project-3.svg",
    },
  ] satisfies Project[],

  testimonials: [
    {
      quote:
        "Working with Guil felt like having a co\u2011founder on the design side. We moved faster and made better decisions because of it.",
      author: "Placeholder Name",
      role: "Founder, Placeholder Co.",
    },
    {
      quote:
        "Rare combination of taste, pragmatism, and follow\u2011through. Our product is dramatically better because of this partnership.",
      author: "Placeholder Name",
      role: "CEO, Placeholder Inc.",
    },
  ] satisfies Testimonial[],

  socials: [
    { label: "Email", href: "mailto:hello@example.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Twitter", href: "https://twitter.com/" },
    { label: "GitHub", href: "https://github.com/" },
  ] satisfies Social[],
} as const;
