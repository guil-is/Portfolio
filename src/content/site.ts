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
    "Fractional design partner for early\u2011stage teams. I help founders ship 0\u21921 products: brand, product, and everything in between. Based in Berlin.",
  metaTitle: "Guil Maueler | Fractional Design Partner",

  introHeading:
    "Design partner for early\u2011stage teams building at the edge of what\u2019s possible.",

  hero: {
    portrait: "/guil_prof_2026_1.jpg",
    portraitAlt: "Portrait of Guil",
    bio: [
      "I\u2019m Guil, a creative director and senior designer based in Berlin. I partner with founders and small teams to turn rough ideas into products people actually want to use, from brand strategy to shipped pixels.",
      "My background spans creative direction at General Magic, co\u2011founding Regens Unite, and years of video and motion work at N26. These days I\u2019m drawn to projects at the intersection of design, community, and decentralized systems. Work that deepens our connection with each other and the world around us.",
    ],
    bioClosing:
      "Currently open to new partnerships. Best fit: mission\u2011driven teams at the earliest stages.",
    cta: { label: "let\u2019s talk", href: "https://cal.com/guil-is" },
  },

  trustedBy: {
    label: "Clients & collaborators",
    viewAllHref: "/clients",
    viewAllLabel: "View all >",
    logos: [
      { name: "N26", src: "/logos/Logo_n26.svg" },
      { name: "JKR Global", src: "/logos/Logo_jkr.svg" },
      { name: "Optimism", src: "/logos/Logo_optimism.svg" },
      { name: "Celo", src: "/logos/CELO.svg" },
      { name: "Gitcoin", src: "/logos/Logo_gitcoin.svg" },
      { name: "Native Instruments", src: "/logos/Logo_native%20instruments.svg" },
      { name: "ENS", src: "/logos/Logo_ens.svg" },
      { name: "Polygon", src: "/logos/P_olygon.svg" },
      { name: "Ethereum Foundation", src: "/logos/ethereum%20foundation.svg" },
    ],
  },

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
      "I work as a design co\u2011founder for your earliest phase: figuring out what the thing is and setting the visual bar, so by the time you bring on your first full\u2011time designer, they inherit a foundation, not a mess.",
    items: [
      {
        title: "Brand & Identity",
        description:
          "Strategy, naming, visual identity, brand systems. I\u2019ve shaped the brand vision for everything from solo founders to large organisations like N26 and Burger King. The goal is always the same: find the story that makes people care.",
        icon: "map" as const,
      },
      {
        title: "Product Design",
        description:
          "End\u2011to\u2011end product design: research, prototypes, UI, and engineering handoff. I don\u2019t hand over a Figma file and disappear; I pair with your devs until the real thing ships.",
        icon: "pen" as const,
      },
      {
        title: "Creative Direction",
        description:
          "Art direction, motion, video, and illustration. Years of building a body of work as a collage artist and animator taught me to sweat the details and set a visual bar the whole team can rally around.",
        icon: "eye" as const,
      },
      {
        title: "Team & Process",
        description:
          "From co\u2011founding Regens Unite to building design culture at General Magic, I\u2019ve learned that great work comes from great coordination. I can help you hire, set up design ops, and build a creative culture.",
        icon: "users" as const,
      },
    ],
  },

  howWeWork: {
    heading: "How we\u2019ll work together",
    intro:
      "Every engagement moves through three phases. I specialize in the first two, and make myself replaceable by the third.",
    phases: [
      {
        label: "Phase 1",
        title: "Discovery & direction",
        description:
          "We figure out what the thing is. Brand strategy, design system foundation, key flows, visual direction. The fog\u2011clearing phase where ideas become tangible.",
      },
      {
        label: "Phase 2",
        title: "Shipping & iteration",
        description:
          "We ship. Settings screens, edge cases, onboarding, marketing site, launch assets. Tight loops with your engineers until the real product is live.",
      },
      {
        label: "Phase 3",
        title: "Handoff",
        description:
          "When it\u2019s time for your first full\u2011time designer, I help you hire them, onboard them, and set up a creative culture that outlasts my engagement.",
      },
    ],
  },

  bottomCta: {
    heading: "Let\u2019s build something together.",
    sub: "Currently open to new partnerships.",
    cta: { label: "book a call", href: "https://cal.com/guil-is" },
  },

  footerSocials: [
    { label: "Read.cv", href: "https://read.cv/guil", icon: "readcv" },
    { label: "Twitter", href: "https://twitter.com/guil_is", icon: "twitter" },
    { label: "Linkedin", href: "https://www.linkedin.com/in/gmaueler/", icon: "linkedin" },
    { label: "Instagram", href: "https://www.instagram.com/gmaueler/", icon: "instagram" },
  ] satisfies Social[],

  about: {
    metaTitle: "About | Guil Maueler",
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
    whyIDoThis: {
      heading: "Why I do this",
      paragraphs: [
        "What draws me to this work isn\u2019t the exit or the flag on the hill. It\u2019s the craft itself: the moment in a room with a whiteboard where rough ideas click into a direction, and design becomes the tool for figuring out what something actually wants to be.",
        "I\u2019ve been practicing that craft for over a decade across brand, product, motion, and community. The best days are still the ones that begin with \u201Cso what if we\u2026\u201D. I\u2019d rather dedicate my life to that practice than to any single product or legacy.",
      ],
    },
    expertise: [
      {
        title: "brand & motion design",
        description:
          "I\u2019m specialised in branding and visual design. Together with great, international teams I\u2019ve helped shape the brand & product vision on a variety of initiatives, from single entrepreneurs and small start\u2011ups to large organisations.",
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
    metaTitle: "About (extended) | Guil Maueler",
    description:
      "A longer story about Guil Maueler: from Rio de Janeiro, to Pira, to Berlin and N26.",
    hero: {
      heading: "Hello friends!",
      paragraph:
        "Thanks for taking the time to read this little intro. I\u2019ll try to make it short and sweet. If you\u2019d like to know more about a specific part of my story, feel free to ask ;)",
    },
    sections: [
      {
        heading: "The basic stuff",
        paragraphs: [
          "I\u2019m originally from Rio de Janeiro, Brazil, but have lived in many countries. Relocated to Berlin in July 2016. I\u2019ve been working as a designer for over a decade, wearing many creative hats along the way.",
          "In the past few years I\u2019ve been performing mainly as a Senior Motion Designer and Art Director.",
        ],
      },
      {
        heading: "The past",
        paragraphs: [
          "For three years I worked at the German neo\u2011bank N26, where I was part of the global brand team developing creative video content, mostly for marketing campaigns, but also on the product side (app interactions) and internal comms (employee branding, company culture and knowledge sharing).",
          "Before that, me and Felipe used to run our own design agency called Pira. We ran the company for six years, and one of our main drivers there was to use our combined creative power to inspire people and to be catalysts for social change. We did that by providing a wide range of design services, connecting with other socially\u2011driven organisations, and initiating a number of community\u2011led projects ourselves. Some of the services we provided were creative consultancy, graphic design, illustration, web design, video & motion, and we also performed graphic recording and facilitation under the brand \u201CF\u00e1cil\u201D. Pira was the birthplace of ideas and the operational backbone of many entrepreneurial initiatives. The most notable of which was Catete92.",
          "Catete92 was a self\u2011managed coworking space that Felipe, myself and a few others co\u2011founded and bootstrapped in the heart of Rio de Janeiro. Based on P2P ideals, it essentially worked as an off\u2011chain DisCO (even though we didn\u2019t call it that at the time). Management and physical infrastructure were completely mutualized, everyone could own a copy of the keys to the space, and it ran on crowdfunding alone. The only rule was that no one was to live there (except for Z\u00e9, our beloved black cat). Participating in the co\u2011creation of this project was a life\u2011changer. It allowed for an enormous amount of learnings and connections that I carry to this day.",
        ],
      },
    ],
  },

  contact: {
    metaTitle: "Get in touch | Guil Maueler",
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
