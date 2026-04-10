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
  title: "Fractional Design Partner",
  description:
    "Fractional design partner for early\u2011stage teams. I help founders ship 0\u21921 products \u2014 brand, product, and everything in between. Based in Berlin.",
  metaTitle: "Guil Maueler \u2014 Fractional Design Partner",

  introHeading:
    "Fractional Design Partner helping founders ship 0\u2192\u202f1 products.",

  hero: {
    portrait: "/projects/guil-portrait-2023-2-sq.jpg",
    portraitAlt: "Portrait of Guil",
    bio: [
      "I partner with early\u2011stage teams to turn rough ideas into products people actually want to use \u2014 from brand strategy and identity to product design and launch.",
      "Previously led creative direction at General Magic, co\u2011founded Regens Unite, and designed products at N26. Now I work as a fractional design partner, embedding with one or two teams at a time.",
    ],
    bioClosing: "Currently accepting new partnerships.",
    cta: { label: "let\u2019s talk", href: "https://cal.com/guil-is" },
  },

  clients: [
    "N26",
    "General Magic",
    "Regens Unite",
    "ClawBank",
    "Burger King",
    "Citizen Wallet",
    "The DAOist",
    "Commons Stack",
  ],

  heroSocials: [
    { label: "Twitter", href: "https://twitter.com/guil_is", icon: "twitter" },
    { label: "Linkedin", href: "https://www.linkedin.com/in/gmaueler/", icon: "linkedin" },
    { label: "Instagram", href: "https://www.instagram.com/gmguil/", icon: "instagram" },
  ] satisfies Social[],

  activeProjects: [
    {
      title: "Regens Unite",
      role: "co\u2011founder & creative director",
      description:
        "A movement of events and educational media bridging the gaps between the broad range of sectors working on regenerative solutions, connecting expertise with innovation.",
      href: "https://regensunite.earth",
      image: "/projects/Regens-Unite.jpg",
      imageAlt: "Regens Unite",
    },
    {
      title: "ClawBank",
      role: "design partner",
      description:
        "ClawBank gives your agent a company. Bank account, crypto wallet, legal entity, debit card. All rails. One API key.",
      href: "https://clawbank.co/",
      image: "/projects/clawbank-thumbnail.jpg",
      imageAlt: "ClawBank",
      reverse: true,
    },
  ] satisfies ActiveProject[],

  howIWork: {
    heading: "How I work",
    intro:
      "I embed with your team as a fractional design partner \u2014 not an agency, not a contractor. I treat every project like it\u2019s my own.",
    items: [
      {
        title: "Brand & Identity",
        description:
          "From naming and strategy to visual identity and brand systems. I help you find the story that makes people care.",
        icon: "map" as const,
      },
      {
        title: "Product Design",
        description:
          "End\u2011to\u2011end product design \u2014 research, wireframes, prototypes, UI, and handoff. I pair directly with engineering to ship in the real product.",
        icon: "pen" as const,
      },
      {
        title: "Creative Direction",
        description:
          "Art direction, motion, video, and illustration. I set the visual bar and make sure everything that ships feels intentional.",
        icon: "eye" as const,
      },
      {
        title: "Team & Process",
        description:
          "I help you hire your first designer, set up design ops, and build a creative culture that outlasts my engagement.",
        icon: "users" as const,
      },
    ],
  },

  bottomCta: {
    heading: "Let\u2019s build something together.",
    sub: "Currently accepting 1\u20132 new partnerships.",
    cta: { label: "book a call", href: "https://cal.com/guil-is" },
  },

  footerSocials: [
    { label: "Read.cv", href: "https://read.cv/guil", icon: "readcv" },
    { label: "Twitter", href: "https://twitter.com/guil_is", icon: "twitter" },
    { label: "Linkedin", href: "https://www.linkedin.com/in/gmaueler/", icon: "linkedin" },
    { label: "Instagram", href: "https://www.instagram.com/gmaueler/", icon: "instagram" },
  ] satisfies Social[],

  about: {
    metaTitle: "About \u2014 Guil Maueler",
    description:
      "Guilherme Maueler is a creative director, brand designer, and videographer residing in Berlin.",
    hero: {
      heading: "Hi, I\u2019m Guil \u{1F44B}",
      paragraphs: [
        "I\u2019m a creative conspirer at the service of ideas that evolve how we can relate to the world and to each other. I believe in exponential impact through the power of communication, design, facilitation and community building.",
        "Currently working from Berlin as a freelancer for individual clients, agencies, collectives, NGOs and social enterprises. Since 2020, member and co\u2011creator of a few Web3 communities, where I investigate decentralised systems and the role design can play in shaping a more inclusive, diverse, distributed and democratic future.",
      ],
      portrait: "",
      portraitAlt: "Portrait of Guil",
    },
    expertise: [
      {
        title: "brand & motion design",
        description:
          "I\u2019m specialised in branding and visual design. Together with great, international teams I\u2019ve helped shape the brand & product vision on a variety of initiatives \u2014 from single entrepreneurs and small start\u2011ups to large organisations.",
      },
      {
        title: "art direction",
        description:
          "My expertise as an art director has been in constant development since my years as co\u2011founder of Pira, a design agency and arthouse with a sharp focus on activism and social innovation projects.",
        linkLabel: "Pira",
        linkHref: "https://www.estudiopira.com.br",
      },
      {
        title: "organisational development",
        description:
          "Since working on a number of community\u2011driven projects, organisational development became a big area of interest for me. I will naturally gravitate towards initiatives that aim to foster higher levels of collaboration and cooperation within their operations.",
      },
    ],
    extendedLink: {
      href: "/about/extended",
      label: "read the longer story",
    },
  },

  aboutExtended: {
    metaTitle: "About (extended) \u2014 Guil Maueler",
    description:
      "A longer story about Guil Maueler \u2014 from Rio de Janeiro, to Pira, to Berlin and N26.",
    hero: {
      heading: "Hello friends!",
      paragraph:
        "Thanks for taking the time to read this little intro. I\u2019ll try to make it short and sweet. If you\u2019d like to know more about a specific part of my story, feel free to ask ;)",
    },
    sections: [
      {
        heading: "The basic stuff",
        paragraphs: [
          "I\u2019m originally from Rio de Janeiro, Brazil, but have lived in many countries. Relocated to Berlin in July 2016. I\u2019ve been working as a designer for over a decade \u2014 wearing many creative hats along the way.",
          "In the past few years I\u2019ve been performing mainly as a Senior Motion Designer and Art Director.",
        ],
      },
      {
        heading: "The past",
        paragraphs: [
          "For three years I worked at the German neo\u2011bank N26, where I was part of the global brand team developing creative video content \u2014 mostly for marketing campaigns, but also on the product side (app interactions) and internal comms (employee branding, company culture and knowledge sharing).",
          "Before that, me and Felipe used to run our own design agency called Pira. We ran the company for six years, and one of our main drivers there was to use our combined creative power to inspire people and to be catalysts for social change. We did that by providing a wide range of design services, connecting with other socially\u2011driven organisations, and initiating a number of community\u2011led projects ourselves. Some of the services we provided were creative consultancy, graphic design, illustration, web design, video & motion, and we also performed graphic recording and facilitation under the brand \u201CF\u00e1cil\u201D. Pira was the birthplace of ideas and the operational backbone of many entrepreneurial initiatives \u2014 the most notable of which was Catete92.",
          "Catete92 was a self\u2011managed coworking space that Felipe, myself and a few others co\u2011founded and bootstrapped in the heart of Rio de Janeiro. Based on P2P ideals, it essentially worked as an off\u2011chain DisCO (even though we didn\u2019t call it that at the time). Management and physical infrastructure were completely mutualized, everyone could own a copy of the keys to the space, and it ran on crowdfunding alone. The only rule was that no one was to live there (except for Z\u00e9, our beloved black cat). Participating in the co\u2011creation of this project was a life\u2011changer \u2014 it allowed for an enormous amount of learnings and connections that I carry to this day.",
        ],
      },
    ],
  },

  contact: {
    metaTitle: "Get in touch \u2014 Guil Maueler",
    description:
      "Use the form or email Guil directly at guil@maueler.com. Based in Berlin.",
    heading: "I am based in Berlin, Germany.",
    subheading: "Use the form below or email me directly at",
    emailLabel: "guil[at]maueler.com",
    email: "guil@maueler.com",
    form: {
      nameLabel: "name:",
      namePlaceholder: "Enter your name",
      emailLabel: "email address:",
      emailPlaceholder: "eg: you@yoursite.com",
      subjectLabel: "subject:",
      subjectPlaceholder: "A brief description of your enquiry",
      messageLabel: "message:",
      messagePlaceholder: "Any additional information you\u2019d like to provide?",
      submitLabel: "Send",
      sendingLabel: "Please wait\u2026",
      successTitle: "Message sent.",
      successBody: "Thanks for your enquiry, I\u2019ll be in touch shortly.",
      errorMessage: "Oops! Something went wrong while submitting the form.",
    },
  },
} as const;
