// Single source of truth for portfolio copy.
// Edit this file to update every section of the site.

export type Project = {
  title: string;
  subtitle: string;
  image: string;
  href?: string;
};

export type ApproachItem = {
  title: string;
  description: string;
};

export type Testimonial = {
  quote: string;
  company: string;
  avatar: string;
};

export type Client = {
  name: string;
  logo: string;
};

export type Social = {
  label: string;
  href: string;
};

export const site = {
  name: "Guil Maueler",
  title: "Fractional Design Partner",
  hero: "Fractional Design Partner helping founders ship 0\u2192\u202f1 products.",
  email: "hello@example.com",

  projects: [
    {
      title: "Project One",
      subtitle: "A short tagline for the project",
      image: "/projects/project-1.svg",
    },
    {
      title: "Project Two",
      subtitle: "A short tagline for the project",
      image: "/projects/project-2.svg",
    },
    {
      title: "Project Three",
      subtitle: "A short tagline for the project",
      image: "/projects/project-3.svg",
    },
    {
      title: "Project Four",
      subtitle: "A short tagline for the project",
      image: "/projects/project-4.svg",
    },
  ] satisfies Project[],

  about: {
    headline: "I help early\u2011stage teams ship fast without compromising quality.",
    photo: "/about/portrait.svg",
    paragraphs: [
      "I partner with founders and small teams to turn rough ideas into products people actually want to use. As your design partner, I will:",
    ],
    bullets: [
      "Shape product strategy without drowning you in documents.",
      "Build interactive prototypes to validate ideas quickly.",
      "Pair directly with engineering to iterate in the real product.",
      "Help you hire and grow a design team that is set up to succeed.",
    ],
    learnMoreHref: "#approach",
  },

  capabilities: [
    "Product Design",
    "Branding",
    "Web Design",
    "Strategy",
    "Pitch Decks",
    "Design Systems",
    "Team Building",
    "Coaching",
  ],

  approach: [
    {
      title: "Shared ownership.",
      description:
        "Whether embedded with your team or working independently, I treat every project like it is my own.",
    },
    {
      title: "I work fast.",
      description:
        "Tight iteration loops let us explore a lot of ground until the right direction clicks into place.",
    },
    {
      title: "Show and tell.",
      description:
        "I share work in progress often \u2014 short screen recordings and walkthroughs beat long documents.",
    },
    {
      title: "Bias for action.",
      description:
        "I prefer tangible artifacts: a prototype, a mock, a working page \u2014 anything you can react to.",
    },
    {
      title: "I work in systems.",
      description:
        "Reusable components and a light design system that grows with your product, not ahead of it.",
    },
    {
      title: "Design is thinking.",
      description:
        "I explore divergent directions before converging. The more options on the table, the better.",
    },
  ] satisfies ApproachItem[],

  clients: [
    { name: "Studio", logo: "/clients/studio.svg" },
    { name: "Northwind", logo: "/clients/northwind.svg" },
    { name: "Orbit", logo: "/clients/orbit.svg" },
    { name: "Fieldnotes", logo: "/clients/fieldnotes.svg" },
    { name: "Cascade", logo: "/clients/cascade.svg" },
  ] satisfies Client[],

  testimonials: [
    {
      quote:
        "Working with Guil felt like having a co\u2011founder on the design side. We moved faster and made better decisions because of it. His ability to jump into the early stages of an open\u2011ended project and rapidly develop structure is rare.",
      company: "Placeholder Co.",
      avatar: "/avatars/avatar-1.svg",
    },
    {
      quote:
        "A rare combination of taste, pragmatism, and follow\u2011through. Guil helped us visualize an ambitious product story and then turned it into something tangible our whole team could rally around.",
      company: "Placeholder Inc.",
      avatar: "/avatars/avatar-2.svg",
    },
    {
      quote:
        "Guil plugged in seamlessly and brought deeply researched insights and strategic thinking to our concept. The final work was polished and shipped \u2014 not just a deck.",
      company: "Placeholder Labs",
      avatar: "/avatars/avatar-3.svg",
    },
  ] satisfies Testimonial[],

  contact: {
    greeting: "Hi there! Ask me anything.",
    suggestions: [
      "Can I see examples of your past work?",
      "Do you work on branding or just product design?",
      "What makes you different from a design agency?",
      "What happens if we\u2019re not the right fit?",
    ],
  },

  socials: [
    { label: "Email", href: "mailto:hello@example.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Twitter", href: "https://twitter.com/" },
  ] satisfies Social[],
} as const;
