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

export const siteTestimonials: Testimonial[] = [
  {
    name: "Justice Conder",
    role: "Founder",
    project: "ClawBank",
    projectHref: "/projects/clawbank",
    quote:
      "I've never worked with a more talented designer. He invests his heart and soul into finding the thing you don't even know you're missing. His touch instantly elevates a project into a higher level of legitimacy.",
    social: { platform: "twitter", url: "https://x.com/singularityhacker" },
    avatarUrl: "https://unavatar.io/x/singularityhacker",
    initials: "JC",
  },
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
    name: "Tamara Helenius",
    role: "Co-founder",
    project: "Commons Stack",
    quote:
      "Guil consistently delivers a level of taste and judgment shaped by years of obsessive attention to the smallest details. He has few equals in UX and branding.",
    social: {
      platform: "linkedin",
      url: "https://www.linkedin.com/in/tamarahelenius/",
    },
    avatarUrl: "/tam.png",
    initials: "TH",
  },
];
