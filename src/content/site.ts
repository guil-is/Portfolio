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
    portrait: "/projects/guil-portrait-2023-2-sq.jpg",
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
      image: "/projects/GM-cover.jpg",
      imageAlt: "General Magic",
    },
    {
      title: "Regens Unite",
      role: "co\u2011founder & creative director",
      description:
        "A movement of events and educational media bridging the gaps between the broad range of sectors working on regenerative solutions, connecting expertise with innovation.",
      href: "https://regensunite.earth",
      image: "/projects/Regens-Unite.jpg",
      imageAlt: "Regens Unite",
      reverse: true,
    },
    {
      title: "Citizen Wallet",
      role: "lead designer",
      description:
        "An open\u2011source crypto wallet for community currencies that leverages account abstraction, catering to the non\u2011web3 audience. No sign\u2011up, no setup required, no gas fees. Anyone can do it.",
      href: "https://citizenwallet.xyz/",
      image: "/projects/Citizen-Wallet.jpg",
      imageAlt: "Citizen Wallet",
    },
    {
      title: "Chinwags",
      role: "lead designer",
      description:
        "Focused retreats for web3 builders. Think hackathons but in beautiful natural spots, with facilitated workshops to address the biggest issues in web3.",
      href: "https://chinwags.webflow.io/chinwag-0",
      image: "/projects/Chinwags.jpg",
      imageAlt: "Chinwags",
      reverse: true,
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
