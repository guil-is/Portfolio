// Past work data transcribed from reference/projects.csv.
// Only rows with a populated Grid Image are included. Sorted by Sort Number asc.
// Image URLs are Webflow CDN URLs that load directly in the browser.

export type PastProject = {
  name: string;
  slug: string;
  client: string;
  services: string;
  summary: string;
  gridImage: string;
  heroVideo?: string;
  link?: string;
  featured?: boolean;
};

export const pastProjects: PastProject[] = [
  {
    name: "Commons Stack Rebrand",
    slug: "commons-stack",
    client: "Commons Stack",
    services: "Website Design, Branding",
    summary: "Redesigning Commons Stack\u2019s website from the ground up",
    gridImage:
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/6895dbdba5735c8ae015b257_commonsstack-opt.gif",
    link: "https://commonsstack.org",
    featured: true,
  },
  {
    name: "Thrive Protocol",
    slug: "thrive",
    client: "Thrive",
    services: "Brand Strategy, Brand Design, Product Design, Web Design",
    summary:
      "A new brand for Thrive: a commitment to support and fund real value in crypto and beyond.",
    gridImage:
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc7ba8258bf6b9cc26279_Thrive-thumb_opt.gif",
    link: "https://www.thrive.xyz/",
    featured: true,
  },
  {
    name: "Chinwags",
    slug: "chinwags",
    client: "web3 retreat",
    services: "Branding, Event Organising, Video Production",
    summary:
      "Bringing together web3 governance builders in nature for deep workshops, unconference sessions, and collaborative solution design",
    gridImage:
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/68933d945669a734519abee3_Chinwags.jpg",
    link: "https://chinwags2023.webflow.io/chinwag-0",
    featured: true,
  },
  {
    name: "The DAOist",
    slug: "the-daoist",
    client: "Web3 Community",
    services: "Branding . Event Production . Web Design . Video . Community Building",
    summary:
      "Building a thriving web3 community centered on the people building decentralized governance systems.",
    gridImage:
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/634ecae91bd7b71da2d75dd0_The%20DAOist%20Thumbnail-opt.gif",
    heroVideo: "https://youtu.be/LF0QYO7P_Cg",
    link: "https://thedaoist2.webflow.io/",
    featured: true,
  },
  {
    name: "Arbitrum Govhack Denver",
    slug: "hack-humanity",
    client: "Hack Humanity",
    services: "Brand Design, Event Organization, Media Production",
    summary:
      "Turning governance into a movement. I shaped GovHack ETHDenver 2024\u2019s identity, experience, and story from concept to final cut.",
    gridImage:
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/689f1ce88d88bf2fcc01a1f0_Arb%20GovHack_Thumnail.jpg",
    heroVideo: "https://www.youtube.com/watch?v=-0Bt-wQt8sE",
    featured: true,
  },
  {
    name: "Prime DAO",
    slug: "prime-dao",
    client: "Kolektivo Labs",
    services: "Branding . UX/UI . Content Creation . Design Ops",
    summary:
      "PrimeDAO is a group of web3 builders focused on scaling DAOs by providing vital, open\u2011source infrastructure that benefits the entire ecosystem.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/634f0f8b0d3d131382dd0605_Prime%20DAO%20thumb-opt.gif",
    heroVideo: "https://www.youtube.com/watch?v=46w4ZCJz__U",
    link: "https://www.prime.xyz/",
  },
  {
    name: "Burger King Rebrand",
    slug: "burger-king-rebrand",
    client: "JKR Global",
    services: "Motion graphics",
    summary:
      "Bringing together Burger King\u2019s all\u2011new brand elements into an engaging sizzle video.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/60259aedf149fee1b4039051_201028_BK-Sizzle-Animation_Thumbnail.gif",
    heroVideo: "https://www.youtube.com/watch?v=xwH4oVnuIAs",
  },
  {
    name: "Pride",
    slug: "n26-pride",
    client: "N26",
    services: "End\u2011to\u2011End video production",
    summary:
      "Colorful. Fabulous. Proud! N26 celebrates the voices of their queer employees.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb970d8dcec7ac0b4cf1453_n16-pride.gif",
    heroVideo: "https://www.youtube.com/watch?v=kGTUZSdNmXI",
    featured: true,
  },
  {
    name: "Octopus",
    slug: "octopus",
    client: "Octopus Beer",
    services: "Illustration",
    summary:
      "Packaging illustrations for Octopus, a Brazilian brewery specialised in delicious craft beers.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb999eeea432fae4b207b42_octopus-grid-3.jpg",
  },
  {
    name: "Distributed cooperatives",
    slug: "disco-coop",
    client: "Disco.coop",
    services: "brand design",
    summary:
      "The DisCO Project is a friendly and carefully planned approach for organizations that want to create and share value in ways that are cooperative, commons\u2011oriented and rooted in feminist economics.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/6026cdee7a12e92375e4f199_DisCO-Elements-Thumbnail.gif",
    heroVideo: "https://www.youtube.com/watch?v=IcRkKuxgxXk",
  },
  {
    name: "Metal",
    slug: "metal",
    client: "N26",
    services: "Art Direction . Production",
    summary: "N26 launches and re\u2011designs its premium Metal card.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5ea02af4f9a5b171b4426749_metal-gif2.gif",
    heroVideo: "https://www.youtube.com/watch?v=hHXb-WtHTTI",
    featured: true,
  },
  {
    name: "N\u00e3o se iluda n\u00e3o",
    slug: "nao-se-iluda",
    client: "Intr\u00ednseca",
    services: "End\u2011to\u2011end video production",
    summary:
      "Series of booktrailers for \u201CN\u00e3o se Iluda n\u00e3o\u201D, published by Intr\u00ednseca.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5ea04e55cdb553835c52eb01_nao-se-iluda-nao.gif",
    heroVideo: "https://vimeo.com/180285456",
  },
  {
    name: "Annie O",
    slug: "annie-o",
    client: "N26",
    services: "End\u2011to\u2011end video production",
    summary: "Investment banker to Berlin DJ \u2014 N26 Business Black",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5ea02dfd9816bbe2495ae9d0_Annie-O.gif",
    heroVideo: "https://www.youtube.com/watch?v=QWXnppQNTcg",
    featured: true,
  },
  {
    name: "Ruby Barber",
    slug: "ruby-barber",
    client: "N26",
    services: "End\u2011to\u2011end video production",
    summary:
      "Make your business bloom like Ruby Barber\u2019s \u2014 N26 Business Black",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5ea04b503342e060df0d32a9_RubyBarber.gif",
    heroVideo: "https://youtu.be/ybT_cc4hfDI",
    featured: true,
  },
  {
    name: "Spaces",
    slug: "n26-spaces",
    client: "N26",
    services: "End\u2011to\u2011end Video Production",
    summary: "N26 launches its much praised sub\u2011account feature, Spaces.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb989dc77084eaaabb1c527_spaces%203.gif",
    heroVideo: "https://www.youtube.com/watch?v=rejvsITkYQI",
    featured: true,
  },
  {
    name: "Amigos & Fantasmas",
    slug: "amigos-fantasmas",
    client: "Pessoal da Nasa",
    services: "post\u2011production",
    summary: "Post\u2011production for music video by Pessoal da Nasa.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb9472fd2e1d321a3598fcb_Amigos-grid.gif",
    heroVideo: "https://www.youtube.com/watch?v=owfqYbXpchs",
  },
  {
    name: "The mobile bank",
    slug: "n26-product-videos",
    client: "N26",
    services: "End\u2011to\u2011end video production",
    summary: "Product explainer videos for the prominent German neobank.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb59347d4d4d9426178cc8d_030420_N26-OVERVIEW_EN_opt.gif",
    heroVideo: "https://www.youtube.com/watch?v=ig40B7n9kbM",
  },
  {
    name: "BeijosXXXX",
    slug: "beijosxxxx",
    client: "Agora Collective",
    services: "Illustration",
    summary:
      "Animated illustrations for Agora Collective\u2019s goodbye party BEIJOSXXXX.",
    gridImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb99572233295464344c7a8_BEIJOSXXX-crop.gif",
  },
];
