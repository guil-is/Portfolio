// Single source of truth for homepage copy.
// Content transcribed from the Webflow export (reference/webflow/index.html).

export type Social = {
  label: string;
  href: string;
  icon: "twitter" | "linkedin" | "instagram" | "readcv";
};

export type ActiveProject = {
  title: string;
  role: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
};

export type Expertise = {
  title: string;
  description: string;
  icon: "map" | "eye" | "pen" | "users";
};

export const site = {
  name: "Guil Maueler",
  title: "Creative Direction & Brand Design",
  description:
    "Guil is a creative director, brand designer, and videographer helping organisations build transformative products & brands. Based in Berlin",
  metaTitle: "Guil Maueler | Creative Direction & Brand Design",

  introHeading:
    "\u{1F44B} Hi, I\u2019m Guil \u2014 a creative lead, brand designer, and community builder striving towards a regenerative future.",

  hero: {
    portrait: "/portrait.jpg",
    portraitAlt: "Portrait of Guil",
    bio: [
      "I\u2019m driven by the belief that communication, design, and community can spark exponential systemic change. My passion is in crafting ideas that deepen our sense of connection with each other and the world around us.",
      "As a member and co\u2011creator of several Web3 communities, I\u2019m deeply invested in exploring decentralized systems and how thoughtful design can shape a more inclusive, diverse, and democratic future.",
    ],
    bioClosing: "Let\u2019s collaborate to bring your vision to life.",
    cta: { label: "let\u2019s talk", href: "https://cal.com/guil-is" },
  },

  heroSocials: [
    { label: "Twitter", href: "https://twitter.com/guil_is", icon: "twitter" },
    { label: "Linkedin", href: "https://www.linkedin.com/in/gmaueler/", icon: "linkedin" },
    { label: "Instagram", href: "https://www.instagram.com/gmguil/", icon: "instagram" },
  ] satisfies Social[],

  activeProjects: [
    {
      title: "General Magic",
      role: "creative director / design lead",
      description:
        "A group of Web3 professionals exclusively supporting public goods and crypto\u2011philanthropic organizations that create greater value for society. We do that by building digital products, governance systems, and economic models.",
      href: "https://www.generalmagic.io/",
      image: "", // placeholder until user uploads /public/projects/general-magic.jpg
      imageAlt: "General Magic",
    },
    {
      title: "Regens Unite",
      role: "co\u2011founder & creative director",
      description:
        "A movement of events and educational media bridging the gaps between the broad range of sectors working on regenerative solutions, connecting expertise with innovation.",
      href: "https://regensunite.earth",
      image: "",
      imageAlt: "Regens Unite",
      reverse: true,
    },
    {
      title: "Citizen Wallet",
      role: "lead designer",
      description:
        "An open\u2011source crypto wallet for community currencies that leverages account abstraction, catering to the non\u2011web3 audience. No sign\u2011up, no setup required, no gas fees. Anyone can do it.",
      href: "https://citizenwallet.xyz/",
      image: "",
      imageAlt: "Citizen Wallet",
    },
  ] satisfies ActiveProject[],

  expertise: [
    {
      title: "brand strategy",
      description:
        "I\u2019m specialised in strategic branding. Together with great, international teams i\u2019ve helped shape the brand & product vision on a variety of initiatives \u2014 from single entrepreneurs and small start\u2011ups to large organisations.",
      icon: "map",
    },
    {
      title: "art direction",
      description:
        "My expertise as a creative director has been in constant development since my years as co\u2011founder of Pira in 2011, a design agency and arthouse with a sharp focus on activism and social innovation projects.",
      icon: "eye",
    },
    {
      title: "motion design & illustration",
      description:
        "I have a deep passion for creating visually captivating images, both static and in motion. For many years I\u2019ve been developing a body of work as a collage illustrator and animator. You can check some of that work on my instagram or here.",
      icon: "pen",
    },
    {
      title: "organizational development",
      description:
        "Since working on many community\u2011driven projects and social enterprises, organizational development has become a big focus area for me. I naturally gravitate towards initiatives that encourage better collaboration and cooperation among their team members. It\u2019s all coordination, always has been ;)",
      icon: "users",
    },
  ] satisfies Expertise[],

  bottomCta: {
    heading: "Interested in working together?",
    sub: "Let\u2019s chat.",
    cta: { label: "book a call", href: "https://cal.com/guil-is" },
  },

  footerSocials: [
    { label: "Read.cv", href: "https://read.cv/guil", icon: "readcv" },
    { label: "Twitter", href: "https://twitter.com/guil_is", icon: "twitter" },
    { label: "Linkedin", href: "https://www.linkedin.com/in/gmaueler/", icon: "linkedin" },
    { label: "Instagram", href: "https://www.instagram.com/gmaueler/", icon: "instagram" },
  ] satisfies Social[],
} as const;
