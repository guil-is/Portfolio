// Past work data transcribed from reference/projects.csv.
// Only rows with a populated Grid Image are included. Sorted by Sort Number asc.
// Image URLs are Webflow CDN URLs that load directly in the browser.

export type ProjectFeature = {
  image?: string;
  caption?: string;
};

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
  /** Dedicated hero image, used when no heroVideo is set. Falls back to gridImage. */
  mainImage?: string;
  /** Rich HTML body rendered as the project article. Sanitized at build time. */
  projectDetails?: string;
  /** Alternating image + caption feature rows. */
  features?: ProjectFeature[];
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
    mainImage:
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/6895de047f378a7fe059b90f_CommonsStack%20-%20Home%20-%20Opengraph2.jpg",
    projectDetails:
      "<p id=\"\">The Commons Stack team recently embarked on a major rebranding effort to update their visual identity, messaging, and overall positioning. As part of this rebranding, they needed a new website that would showcase their values, highlight their achievements, and provide valuable educational content. This website would serve as the central hub for the community to engage with the Commons Stack mission.</p><p id=\"\">The project faced several key challenges, including the need for clear communication to effectively convey the Commons Stack's goals, findings, achievements, publications, and partnerships in an accessible way. Establishing brand legitimacy was also crucial, requiring the creation of a professional-looking website to attract public attention and legitimize the project.</p><p id=\"\">Additionally, the site needed to engage investors by serving as a persuasive tool, providing all necessary information for informed decision-making. Finally, the website aimed to support recruitment by attracting contributors, researchers, and other professionals to join the project.</p><p id=\"\">To address these challenges, me and my team executed a multi-phase project plan. We started with a kickoff meeting to clarify goals, reviewed brand guidelines, and developed a project scope and timeline. During the design phase, we created wireframes, visual mockups, and website copy, incorporating client feedback.</p><p id=\"\">After finalizing the design, we built the website on Webflow, conducted testing, and optimized performance. We launched V1 of the website on July 4th 2023 and monitored it post-launch to address any issues.</p><p>‍</p><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1512px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1512px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/6895dd2dde02cdd46bbe3159_Consolidated.jpg\" loading=\"lazy\"></div></figure>"
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
    mainImage:
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc8c76563ae4fa076fec0_home%20page.gif",
    projectDetails:
      "<p>Led the end-to-end rebrand of Thrive, evolving it from a fast-shipping Web3 startup into a sharper, more cohesive Proof-of-Value brand with a clear narrative, scalable design system, and product-marketing alignment.</p><p>Read the <a href=\"https://www.thrive.xyz/blog/proof-of-value-has-a-new-look\">full blog post</a> for a deeper look at the strategy, positioning decisions, visual language, and how the new system translates across product, ecosystem campaigns, and token launch readiness.</p><p>‍</p><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc8e365661b35d3e86ccd_Brand_Blog_2.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc93edae63622df44e5cf_logo-anatomy.gif\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc9509945feab35a0f4d0_Brand_Blog_4.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc95fa697f73ef9c893c0_Brand_Blog_6.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc9716563ae4fa0771f55_Brand_Blog_7.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc97df04f2c4187ecdfbd_Brand_Blog_8.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc9890e498e6e75e0b644_Brand_Blog_9.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc994cf504554d87f4cf3_Brand_Blog_10.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc99e2968cfbe029a99a6_Brand_Blog_11.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1280px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1280px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dc9a98258bf6b9cc2cc5a_Brand_Blog_12.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:960px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"960px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/699dcaa8e121761b4d4c52e3_Thrive-logo-anim-opt.gif\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure>"
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
    mainImage:
      "https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/68933d945669a734519abee3_Chinwags.jpg",
    projectDetails:
      "<p id=\"\">Chinwags was a four‑day hybrid retreat held in Poland from May 8–11, 2023. It brought together builders in web3, DAO governance, and related ecosystems for deep workshops, unconference sessions, and collaborative solution design. </p><p id=\"\">‍<strong id=\"\">The goal: create actionable outcomes around DAO operations, adoption, and sustainability.</strong></p><p id=\"\">As branding lead, I developed the visual identity including logo, colour palette, typography, and digital/print assets for all touchpoints. That identity was used consistently across the website, social media (notably <a id=\"\" href=\"https://x.com/chinwags_xyz\">@chinwags_xyz</a>), event materials, and video overlays.<br></p><p id=\"\">I also designed and built the official landing page. The site featured a clear program structure, schedule, venue details, FAQ and team sections. I emphasized clear CTAs: registration, partner highlights, inputs from applicants - and integrated visuals that showcased the venue and session themes &nbsp;</p><p id=\"\">In video production, I worked with videographer Alice Roo to produce event recap videos capturing workshop highlights, participant interactions, and venue moments. I created short clips aligned with the social messaging on X/Twitter to highlight the Chinwags ethos: hands‑on collaboration, nature-based creativity, and deep web3 discussions.</p><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1920px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1920px\"><div><img alt=\"__wf_reserved_inherit\" src=\"https://cdn.prod.website-files.com/5ea0098428bdbf1b20d2c9af/689367f4d95f1333fbabc083_Case%20Study%20-%20Chinwags.jpg\" loading=\"lazy\"></div></figure>"
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
    projectDetails:
      "<h3>A cultural vehicle for collaborative defiance.</h3><p>The era of DAOs had just begun. More than just technical and organizational revolutions, DAOs enable a lifestyle characterized by purpose, ownership, collaboration, and openness. The DAOist supported the cultural revolution needed to enable a world of DAOists. As part of the founding team, I was involved in developing the brand and its community from its inception until July 2022.</p><p>‍</p><p><strong>Branding &amp; Web design</strong></p><ul><li>Designed all core brand assets (logos, sub-logos, colors, textures, illustrations, animations &amp; other brand elements) </li><li>Web design</li><li>Swag design</li><li>Motion Graphics</li><li>Posters</li><li>Slides, presentations, pitch decks</li><li>Design Operations</li><li>Social Media content</li><li>Copywriting</li></ul><p><strong>Event Production &amp; Content Creation</strong></p><ul><li>Co-produced 5 events, each in a different city <a href=\"https://www.thedaoist.co/#events\">(check them here) </a></li><li>Oversaw production of all swag material with local providers.</li><li>Event signage, decorations, maps. </li><li>Oversaw recordings &amp; publishing of talks and panels,</li><li>Shot, edited, mixed &amp; finalized all video content, including episodes of the docuseries <a href=\"https://www.youtube.com/playlist?list=PLwGSVEZFFjEwDzGH0kA9weNDFVmXdr7VJ\">Coordination Junkies.</a></li><li>Managed youtube channel.</li></ul><p><strong>Operations &amp; Community Building</strong></p><ul><li>Setting up community calls.</li><li>Team operational tasks &amp; meetings.</li><li>Co-managing Discord &amp; Telegram channels.</li></ul><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1080px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1080px\"><div><img alt=\"\" src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/634eed7fb5c6903297caf4bf_The%20DAOist%20-%20Brand.png\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div><figcaption><a href=\"http://thedaoist.co\" target=\"_blank\">Click here to visit live website</a></figcaption></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:3233px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"3233px\"><div><img alt=\"\" src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/634eef58144ab90fd7106a75_badges.png\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div><figcaption>Governance badge designs</figcaption></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1080px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1080px\"><div><img alt=\"\" src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/634f0a30de75b06b2d70411c_The%20DAOist%20-%20Swag.png\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=4FK6C-Ycerk&list=PLwGSVEZFFjEwDzGH0kA9weNDFVmXdr7VJ&ab_channel=TheDAOist\"><div><iframe src=\"https://www.youtube.com/embed/4FK6C-Ycerk\" title=\"Coordination Junkies - A new docuseries by The DAOist\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=ilN2BBvQ0_M&ab_channel=TheDAOist\"><div><iframe src=\"https://www.youtube.com/embed/ilN2BBvQ0_M\" title=\"Dawn Ministry Invitation - DO NOT SHARE\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure>"
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
    projectDetails:
      "<p>As part of the core organizing team for GovHack ETHDenver 2024, I led the brand design from the ground up. I developed the event’s visual identity, ensuring every touchpoint - from digital assets and on-site signage to presentation templates - reflected the inclusive, high-energy spirit of the hackathon. The branding needed to resonate with both technical and non-technical participants, making governance feel accessible, collaborative, and worth showing up for.</p><p>Beyond visuals, I coordinated key elements of event execution. This included working closely with track leads, facilitators, and volunteers to streamline the participant experience. I supported the flow of activities, from check-in and team formation to the final stage presentations. My focus was on creating an environment where people felt at ease and where ideas could move quickly from conversation to concrete proposals, supported by clear communication and a cohesive aesthetic.</p><p>I also directed the event’s media production, capturing its energy and impact through daily recaps, interviews, and the official aftermovie. This involved managing a small content team, planning shot lists, and ensuring we documented both the work and the human connections that made GovHack unique. The resulting media not only amplified the event’s reach beyond the room but also created an evergreen asset for future community building.</p><p>Recap videos of each day: <br></p><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=nBc6CW_c_UE\"><div><iframe src=\"https://www.youtube.com/embed/nBc6CW_c_UE\" title=\"Day 1 Recap - Arbitrum GovHack - ETHDenver 2024\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=OzW7ZPcuOq0\"><div><iframe src=\"https://www.youtube.com/embed/OzW7ZPcuOq0\" title=\"Day 2 Recap - Arbitrum GovHack - ETHDenver 2024\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=DzYbD9FVOz0&list=PLkNAiFdvbPL6EY9T0t55U6u4CqxmAO2MK&index=3&ab_channel=HackHumanity\"><div><iframe src=\"https://www.youtube.com/embed/DzYbD9FVOz0\" title=\"Day 3 Recap - Arbitrum GovHack - ETHDenver 2024\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=9eRc01Rj7Mc&list=PLkNAiFdvbPL5jAVtP4pKvtlatPcr2PRla&ab_channel=HackHumanity\"><div><iframe src=\"https://www.youtube.com/embed/9eRc01Rj7Mc\" title=\"Soby from XAI interview - Arbitrum GovHack - ETHDenver 2024\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure>"
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
    projectDetails:
      "<p id=\"\"><strong id=\"\">Branding, UX/UI &amp; Content creation</strong></p><ul id=\"\"><li id=\"\">Redesigned all core brand assets (logos, sub-logos, colors, textures, illustrations, animations &amp; other brand elements)</li><li id=\"\">Brand Book &amp; <a id=\"\" href=\"https://www.prime.xyz/brand\">Online Brand Resources</a></li><li id=\"\">Infographics</li><li id=\"\">Web design</li><li id=\"\">Swag design</li><li id=\"\">Motion graphics &amp; video explainers</li><li id=\"\">Slides, presentations &amp; pitch decks</li><li id=\"\">Design operations</li><li id=\"\">Social Media content</li></ul><figure id=\"\" class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=FhE4kWEiCJM&ab_channel=PrimeDAO\"><div id=\"\"><iframe src=\"https://www.youtube.com/embed/FhE4kWEiCJM\" title=\"Prime Deals - Web3 partnerships made easy\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><figure id=\"\" class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1080px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1080px\"><div id=\"\"><img id=\"\" src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/634f1dfe79503a3b5b8ee58f_PrimeDAO%20-%20Brand.png\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure id=\"\" class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1080px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1080px\"><div id=\"\"><img id=\"\" src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/634f1e600675983b5eae026a_PrimeDAO%20-%20Apparel.png\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div></figure><figure id=\"\" class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1080px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1080px\"><div id=\"\"><img id=\"\" src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/634f1e760d0e4b26c8810650_PrimeDAO%20-%20Web%20design-2.png\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div><figcaption id=\"\"><a id=\"\" href=\"http://prime.xyz\" target=\"_blank\">Click here to visit live website</a></figcaption></figure><figure id=\"\" class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1080px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1080px\"><div id=\"\"><img id=\"\" src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/634f1e7f14e501369a027085_PrimeDAO%20-%20Web%20design.png\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div><figcaption id=\"\">Prime Rating - Web design &amp; CMS System</figcaption></figure><figure id=\"\" class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1080px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1080px\"><div id=\"\"><img id=\"\" src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/634f1e89da7e85867e6c6d3c_PrimeDAO%20-%20Web%20design-1.png\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div><figcaption id=\"\">Prime Rating - Achievement Badges POAPs</figcaption></figure>"
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
    projectDetails:
      "<p>For Burger King’s first global rebrand in more than two decades, JKR set out to make the brand feel less synthetic and artificial, and more real, crave-able and tasty. I was called upon for the task of bringing all the new brand assets into a fast-paced sizzle video. You can find more info on the rebrand <a href=\"https://www.jkrglobal.com/case-studies/burger-king/\">here.</a></p><p>‍</p>"
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
    projectDetails:
      "<p>For 3 consecutive years (2018 - 2020), I was given the opportunity to team up with fellow colleagues to organise and document our Christopher Street Day celebrations. With diversity being part of the company's core values, we formed one of its first ERGs (Employee Resource Group) dedicated to LGBTQA+&nbsp;matters. Above you can view how we paraded in 2018, and below the following year's highlights:</p><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=lpkW3TVjgBg\"><div><iframe src=\"https://www.youtube.com/embed/lpkW3TVjgBg\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=YbXI8LtPHa8\"><div><iframe src=\"https://www.youtube.com/embed/YbXI8LtPHa8\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><p>To learn more details about what happened that day, you can <a href=\"https://medium.com/insiden26/n26-celebrating-csd-berlin-f61000d13248\">check out this blogpost</a> ;)&nbsp;</p>"
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
    mainImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb979a707f37df042ab8589_TWISTOFFATE_GuilhermeMaueler_web.png",
    projectDetails:
      "<p>Since it's very beginning in 2013, Octopus has been all about creating high quality beer recipes, each one of them represented by a unique collage.<a href=\"http://instagram.com/cervejariaoctopus\"> You can check them here.</a></p>",
    features: [
      { image: "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5ebd463094a2761bf857cdbb_120916_octopus_highest-ground_800.jpg" },
      { image: "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5ebd6c16cfa4cba95bc64a08_epping-art.jpg" },
      { image: "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5ebd62c0abfbeb678dcdb0ce_Octopus_Pendulum800_2.jpg" },
    ]
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
    projectDetails:
      "<p>Weaving together practices and principles learned from the Commons and P2P movements, the world of cooperatives and the Social and Solidarity Economy, DisCOs (Distributed Cooperative Organisations) bring forth a proposal for a future of work. I've joined forces with <a href=\"http://elementarycomplexity.webflow.io/\">Felipe Duarte</a> and the DisCO.coop team to shape the ever-evolving Disco Mothership brand universe, with explainer videos, illustrations, infographics and web design.</p><p>You can find more info and read the book for free at<strong> </strong><a href=\"http://elements.disco.coop/\"><strong>elements.disco.coop</strong></a></p><figure class=\"w-richtext-figure-type-image w-richtext-align-center\" data-rt-type=\"image\" data-rt-align=\"center\" data-rt-max-width=\"\"><div><img src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/6026cde109f1dfa5c4b54bd5_Cover_CAT_02.jpg\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div><figcaption>Cover design for Disco.coop's second part of the trilogy, featuring the DisCO \"CAT\" (Community Algorithmic Trust).</figcaption></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-center\" data-rt-type=\"image\" data-rt-align=\"center\"><div><img src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/6026d21a0eafddbf40963a4a_DisCO-CAT_blobs_600x600.gif\" width=\"auto\" height=\"auto\" loading=\"lazy\"></div><figcaption>Playful gif for social media post.</figcaption></figure>"
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
    projectDetails:
      "<blockquote>\"Metal was here before us, and will be here after us. It’s an authentic, raw element&nbsp;of what makes up our world<em>. It also exists beyond our world. Metal is denser, more valuable and longer lasting. Weight is wealth.\"</em></blockquote><p>Made in collaboration with <a href=\"http://timdoldissen.com\">Tim Doldissen</a> and <a href=\"http://juangarciasegura.com/\">Juan García</a>, these two videos were created for the launch (below) and re-design (above) of N26's premium product.</p><p>Focus on the design and physical features that makes the card stand out from the others. We aimed to transmit a sense of suspense, the thrilling sensation of something new and exciting being moulded into existence.</p><p>‍</p><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=CKqSSmN8lyk\"><div><iframe src=\"https://www.youtube.com/embed/CKqSSmN8lyk\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><p><br></p>"
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
    projectDetails:
      "<figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.25%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.25%\" data-rt-dimensions=\"640:360\" data-page-url=\"https://vimeo.com/180285777\"><div><iframe src=\"https://player.vimeo.com/video/180285777\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.25%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.25%\" data-rt-dimensions=\"640:360\" data-page-url=\"https://vimeo.com/180285774\"><div><iframe src=\"https://player.vimeo.com/video/180285774\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure>"
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
    projectDetails:
      "<p>Finance to music is not exactly a well-worn path. Annie O started her career in London as an investment banker bringing in a six-figure salary. But she quickly realised that world was not for her. She quit her job and moved to Berlin to pursue her love for music and is now a successful DJ.</p><p>Read more about her story here: <a href=\"https://l.facebook.com/l.php?u=https%3A%2F%2Fgoo.gl%2FcvcLNo%3Ffbclid%3DIwAR13mOWMRGqRvRmt5R64Jt7bSC2QB-7sDh4R6A98aSDFRnFFS37UHySiZ4A&h=AT2gLm3k045DcSAa6tszU69aNxJ0HKBRG6jpm_g3gooqAFZ6LLL7vlAQO0nWA95Jw9mGRxKYDbe-HOmgOantdt36RwOGYFMaVTbAVicFNGc64U3Q4837-1sDzWySJSO2TedlDUcwjcXU3e3rDOXqXW4\" target=\"_blank\"><strong>https://goo.gl/cvcLNo</strong></a></p><p>Made in collaboration with <a href=\"http://timdoldissen.com\">Tim Doldissen</a></p>"
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
    projectDetails:
      "<p>Entrepreneur Ruby Barber's flower studio Mary Lennox is one of the most highly-regarded in town. She says that's because she's always stuck to her own path—with one eye on the business and another on pushing her creative boundaries.</p><p>Made in collaboration with <a href=\"http://timdoldissen.com\">Tim Doldissen.</a></p>"
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
    projectDetails:
      "<p>During my years at N26, I had the chance to work on a number of product explainer videos.</p><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=fo-j8u3cbzI&ab_channel=N26\"><div><iframe src=\"https://www.youtube.com/embed/fo-j8u3cbzI\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure><figure class=\"w-richtext-figure-type-video w-richtext-align-fullwidth\" style=\"padding-bottom:56.206088992974244%\" data-rt-type=\"video\" data-rt-align=\"fullwidth\" data-rt-max-width=\"\" data-rt-max-height=\"56.206088992974244%\" data-rt-dimensions=\"854:480\" data-page-url=\"https://www.youtube.com/watch?v=csuw7s0j8qk&ab_channel=N26\"><div><iframe src=\"https://www.youtube.com/embed/csuw7s0j8qk\" scrolling=\"no\" frameborder=\"0\" allowfullscreen=\"true\"></iframe></div></figure>"
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
    mainImage:
      "https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb99097a7f2273fbc704041_BEIJOSXXX_SQ.jpg",
    projectDetails:
      "<p>The<a href=\"http://agoracollective.org/\"> Agora Collective</a> - Berlin-based Center for Collaborative Practices - was originally founded in 2011 by a multidisciplinary team as an independent project space in Mittelweg, 50 Berlin. Since then, Agora expands its mission to be a place to conceive and experiment with models of working together; providing stable spaces for artists to engage within collaborative and community-based practices.</p><p>On January 25th 2019, Agora Collective was officially <a href=\"https://www.facebook.com/events/376398236280886/?active_tab=about\">saying goodbye</a> to it's physical space in Rollbergstrasse-Neukölln by throwing an epic party. I was called upon to create the artwork for this historical occasion.</p><p>Below you will find a few different versions (the original event's title was \"Agora do Fim\", switched later to \"BEIJOSXXXX\").</p><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:1619px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"1619px\"><div><img src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb99097d2fe5ad417c7aa9b_Agora%20do%20Fim_SQ.jpg\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:600px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"600px\"><div><img src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb99226fcad52253ec65d72_agora-do-fim.gif\"></div></figure><figure class=\"w-richtext-figure-type-image w-richtext-align-fullwidth\" style=\"max-width:600px\" data-rt-type=\"image\" data-rt-align=\"fullwidth\" data-rt-max-width=\"600px\"><div><img src=\"https://uploads-ssl.webflow.com/5ea0098428bdbf1b20d2c9af/5eb998cc7774168bce793a3b_beijosssXXX-optimized.gif\"></div></figure><p>‍</p>"
  },
];
