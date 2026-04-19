export type Testimonial = {
  /** Who said it. */
  name: string;
  /** Role at the time of the engagement, e.g. "Founder". */
  role: string;
  /** Project or company name the engagement was for. */
  project: string;
  /** Optional link to that project's case study. */
  projectHref?: string;
  /** The actual quote, without surrounding quotation marks — those are
   * added by the component. */
  quote: string;
  /** Public social profile, used as the tiny icon link on the card. */
  social?: {
    platform: "twitter" | "linkedin";
    url: string;
  };
  /** Optional image URL. If omitted, initials are shown on a flat
   * background. */
  avatarUrl?: string;
  /** Two-letter initials shown when avatarUrl is absent. */
  initials: string;
};

export const dummyTestimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "Founder",
    project: "Odyssey",
    projectHref: "/for/odyssey",
    quote:
      "Working with Guil felt like hiring a full design team in one person. He saw the whole system on day one — the brand, the product, and the story we were trying to tell — and moved all three forward at once.",
    social: { platform: "twitter", url: "https://twitter.com/placeholder" },
    initials: "SC",
  },
  {
    name: "Marcus Alvaro",
    role: "Head of Product",
    project: "Clawbank",
    projectHref: "/projects/clawbank",
    quote:
      "Sharp instincts, fast hands, zero ego. Guil ships polished work without the typical freelance friction — briefs get met, edges get found, and the bar keeps going up.",
    social: { platform: "linkedin", url: "https://linkedin.com/in/placeholder" },
    initials: "MA",
  },
  {
    name: "Noor Hassani",
    role: "CEO",
    project: "Northline",
    quote:
      "Guil's the rare designer who cares as much about why something exists as how it looks. Every call ended with us understanding our own product better.",
    social: { platform: "twitter", url: "https://twitter.com/placeholder" },
    initials: "NH",
  },
  {
    name: "Teo Martins",
    role: "Creative Director",
    project: "Prism Agency",
    quote:
      "I've worked with a lot of contractors. Guil is the only one my team asks for by name. His taste is strong and his output speaks for itself.",
    social: { platform: "linkedin", url: "https://linkedin.com/in/placeholder" },
    initials: "TM",
  },
  {
    name: "Rin Takahashi",
    role: "Founding designer",
    project: "Lumen",
    quote:
      "What I appreciated most: he pushed back when it mattered and got out of the way when it didn't. Shipped faster than any team I'd worked with.",
    social: { platform: "twitter", url: "https://twitter.com/placeholder" },
    initials: "RT",
  },
];
