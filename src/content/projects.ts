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
  stillFrames?: string[];
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
    stillFrames: [
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/6893408b603b1da22d91eb72_DSC06850.jpg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/68934095c0cf8619bbf44f1b_DSC06724.jpg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/68934133e19da6cb61a1cd1d_Fv2yFw_aEAA1823.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/6893413346cc496e4f788006_Fv2yFwwaYAEggQu.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/689341331a855364e0425d07_Fv2yMzZaIAE8apR.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/689341332ec99b24ba692583_Fv8A5o4X0AEZnpf.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/68934133c995bf2e71ff1d8d_Fv8A5o5WcAItMEN.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/68934133df23e8da11337490_Fv8A6jJWwAUwEY1.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/68934133e96457565e0a0b84_Fv8A6kqX0AQK5Ml.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/6893413363c4f0318abadefa_FvxWIFsWAAImco3.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/68934133dfe3ddce59f6b430_FvxWIFsXsAAt2ul.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/689341339d9402cc9236256f_FvxWIFvWwAAeVOB.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/68934133bf2c1b15ca3a3f09_Fv8A5o7X0AUL4Ft.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/6893409744aee8ee9a53b08a_DSC06723.jpg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/689341332b1d44e42888d0df_FvxWIFwXsAAvEc5.jpeg",
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/6893413344aee8ee9a53df8b_FwAK02yWwAAdmNg.jpeg",
    ],
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
    stillFrames: [
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb979b0cbfe0707cb8c228e_70960290_716913662156199_2792294801094705818_n.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb97b2536a3e8597be87340_72874420_156344765461768_1475098055660062759_sq.jpg",
    ],
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
    stillFrames: [
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/6026cb0c4de16b65c7687306_Elements_Book%20Mockup4%20copy.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/6026d114fb45897ef5b7e30c_Mockup_Elements_02.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/6026cd99793eee26fef27b26_Mockup_Elements_03%20copy.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/6026d11b918f05273ab5a6ce_Mockup_Elements_03.jpg",
    ],
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
    stillFrames: [
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5b3fd17e59afe14c450a2_56d0f7a4a09aa00a3733cff7_amigos_fantasmas6.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5b3fda7e51e6eefb1f636_56d0f7ac21e2d48d466ecfeb_amigos_fantasmas5.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5b3fda7e51e5f79b1f635_56d0f7ba1aaf2c323e14c6c3_amigos_fantasmas8.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5b3fd170d89848dab9f81_56d0f78e1aaf2c323e14c6c0_amigos_fantasmas3.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5b3fd57f79954856ac3f3_56d0f79ae867b1c13768240e_amigos_fantasmas4.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5b3fd57f79929036ac3f4_56d0f7831aaf2c323e14c6bf_amigos_fantasmas1.jpg",
    ],
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
    stillFrames: [
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5941d51528bd39ec29371_030420_N26-OVERVIEW_EN%202%20(0-00-04-13).jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5943eacb09801a8e9796a_030420_N26-OVERVIEW_EN%202%20(0-00-07-00).jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5951c0956a187c080cc18_030420_N26-OVERVIEW_EN%202%20(0-00-14-04).jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb5951c090054fbcde7497d_030420_N26-OVERVIEW_EN%202%20(0-00-42-16).jpg",
    ],
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
    stillFrames: [
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb9979a8e8bb96795bd9e9f_51223813_2375073435847972_5454755035973943296_o.jpg",
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb9979abd4f3839ce4d6506_51231879_2375075692514413_5669672970377756672_o.jpg",
    ],
  },
];
