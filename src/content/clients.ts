// Clients & partners CMS. Each entry has a name, a short one-line
// description, and an optional URL. Entries are rendered alphabetically
// grouped by first letter on /clients.
//
// To add a new client: just append to the array. The page auto-sorts
// and groups by first letter.

export type Client = {
  name: string;
  description: string;
  href?: string;
};

export const clients: Client[] = [
  // A
  { name: "Arbitrum", description: "Leading Ethereum Layer 2 scaling solution", href: "https://arbitrum.io" },
  // B
  { name: "Burger King", description: "Global rebrand motion graphics (via JKR Global)", href: "https://www.bk.com" },
  // C
  { name: "Celo", description: "Mobile-first blockchain for financial inclusion", href: "https://celo.org" },
  { name: "Chinwags", description: "Focused retreats for web3 governance builders", href: "https://chinwags.webflow.io/chinwag-0" },
  { name: "Citizen Wallet", description: "Open-source crypto wallet for community currencies", href: "https://citizenwallet.xyz" },
  { name: "ClawBank", description: "AI-agent banking: bank account, crypto wallet, legal entity, one API", href: "https://clawbank.co" },
  { name: "Commons Stack", description: "Public goods funding infrastructure for Web3", href: "https://commonsstack.org" },
  // D
  { name: "DisCO.coop", description: "Distributed cooperative organizations rooted in feminist economics" },
  // E
  { name: "ENS", description: "Ethereum Name Service: decentralized naming for wallets and websites", href: "https://ens.domains" },
  { name: "Ethereum Foundation", description: "Supporting the Ethereum ecosystem and protocol development", href: "https://ethereum.foundation" },
  // G
  { name: "General Magic", description: "Web3 professionals supporting public goods and crypto-philanthropy", href: "https://www.generalmagic.io" },
  { name: "Gitcoin", description: "Funding open source and public goods with quadratic mechanisms", href: "https://www.gitcoin.co" },
  // H
  { name: "Hack Humanity", description: "GovHack ETHDenver: governance hackathon and community events" },
  // I
  { name: "Intr\u00ednseca", description: "Brazilian publishing house" },
  // J
  { name: "JKR Global", description: "Brand and design agency behind major global rebrands", href: "https://www.jkrglobal.com" },
  // K
  { name: "Kolektivo Labs", description: "Building regenerative economic tools for local communities" },
  // N
  { name: "N26", description: "Europe\u2019s leading mobile bank", href: "https://n26.com" },
  { name: "Native Instruments", description: "Music production hardware and software", href: "https://www.native-instruments.com" },
  // O
  { name: "Octopus Beer", description: "Brazilian craft brewery with illustrated packaging" },
  { name: "Optimism", description: "Ethereum L2 built on the Optimistic Rollup", href: "https://www.optimism.io" },
  // P
  { name: "Pessoal da Nasa", description: "Brazilian music collective" },
  { name: "Polygon", description: "Ethereum scaling with zero-knowledge proofs", href: "https://polygon.technology" },
  { name: "Prime DAO", description: "Web3 builders scaling DAOs with open-source infrastructure", href: "https://www.prime.xyz" },
  // R
  { name: "Regens Unite", description: "Events and media bridging regenerative sectors", href: "https://regensunite.earth" },
  // T
  { name: "The DAOist", description: "Community and events for decentralized governance builders", href: "https://thedaoist2.webflow.io" },
  { name: "Thrive Protocol", description: "Supporting and funding real value in crypto and beyond", href: "https://www.thrive.xyz" },
];
