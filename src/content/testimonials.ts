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
    name: "Xavier Damman",
    role: "Steward",
    project: "Open Collective, Commons Hub BXL",
    quote:
      "Forget Claude. Guil is the one you need. He just gets it. No prompt fatigue. The perfect balance between art and professionalism. He immediately captured the vibe to design for Regens Unite, the Commons Hub BXL and the playful logo for Citizen Wallet. I'd work with him again in a heartbeat.",
    social: { platform: "twitter", url: "https://x.com/xdamman" },
    avatarUrl: "https://unavatar.io/x/xdamman",
    initials: "XD",
  },
  {
    name: "Griff Green",
    role: "Co-founder",
    project: "Giveth",
    projectHref: "https://giveth.io",
    quote:
      "Working with Guil is like hiring a whole design team in one person. He nails brand, product, and story all in one go and somehow still stays chill the whole time.",
    social: { platform: "twitter", url: "https://x.com/griffgreen" },
    avatarUrl: "https://unavatar.io/x/griffgreen",
    initials: "GG",
  },
  {
    name: "Noor Hassani",
    role: "CEO",
    project: "Northline",
    quote:
      "Guil's the rare designer who cares as much about why something exists as how it looks. Every call ended with us understanding our own product better.",
    social: { platform: "twitter", url: "https://twitter.com/placeholder" },
    avatarUrl: "https://i.pravatar.cc/120?img=32",
    initials: "NH",
  },
  {
    name: "Teo Martins",
    role: "Creative Director",
    project: "Prism Agency",
    quote:
      "I've worked with a lot of contractors. Guil is the only one my team asks for by name. His taste is strong and his output speaks for itself.",
    social: { platform: "linkedin", url: "https://linkedin.com/in/placeholder" },
    avatarUrl: "https://i.pravatar.cc/120?img=14",
    initials: "TM",
  },
  {
    name: "Rin Takahashi",
    role: "Founding designer",
    project: "Lumen",
    quote:
      "What I appreciated most: he pushed back when it mattered and got out of the way when it didn't. Shipped faster than any team I'd worked with.",
    social: { platform: "twitter", url: "https://twitter.com/placeholder" },
    avatarUrl: "https://i.pravatar.cc/120?img=48",
    initials: "RT",
  },
];
