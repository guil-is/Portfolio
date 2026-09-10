/**
 * Merchant rules for the tax-expenses classifier. First match wins, so
 * specific rules sit above broad ones. Confidence at or above
 * AUTO_THRESHOLD (types.ts) is applied without asking; anything lower
 * lands in the swipe queue with `reason` as the "why I'm asking" line.
 *
 * Patterns run against `fold()`ed text: lowercase, no diacritics
 * ("Bäckerei" → "backerei"). Keep word boundaries on short names.
 *
 * Tuned for a Berlin-based freelance designer. Edit freely — the swipe
 * memory (what you taught it) always beats these rules.
 */

import type { Category, Verdict } from "./types";

export type Rule = {
  id: string;
  match: RegExp;
  verdict: Verdict;
  category: Category;
  confidence: number;
  reason: string;
  /** Where the pattern is tested. Default: the partner name only. */
  scope?: "partner" | "any";
  /** Pass-through billers (PayPal, Google Play, Apple): when the payment
   * reference names the real merchant, that merchant's rule wins. */
  passthrough?: boolean;
};

const r = (
  id: string,
  match: RegExp,
  verdict: Verdict,
  category: Category,
  confidence: number,
  reason: string,
  extra?: Pick<Rule, "scope" | "passthrough">,
): Rule => ({ id, match, verdict, category, confidence, reason, ...extra });

export const RULES: Rule[] = [
  // ── Internal / ignore ────────────────────────────────────────────────
  r("self", /\b(guilherme|guil)\b.*\bmaueler\b|\bmaueler\b/, "skip", "internal", 1, "Transfer to yourself"),
  r("wise-topup", /\bwise\b.*(top ?up|guilherme|maueler)|\btransferwise\b.*(top ?up|maueler)/, "skip", "internal", 0.95, "Top-up of your own Wise account", { scope: "any" }),
  r("n26-space", /\bspaces?\b.*(transfer|umbuchung)|(to|from) space/, "skip", "internal", 1, "Move between N26 Spaces", { scope: "any" }),

  // ── Tax-relevant but not a business expense ──────────────────────────
  r("finanzamt", /\bfinanzamt\b|\bbundeskasse\b|\blandeshauptkasse\b|\bfinanzkasse\b|\bkasse\.hamburg\b|\bzentralkasse\b/, "tax", "tax", 0.97, "Tax payment to the Finanzamt", { scope: "any" }),
  r("tax-ref", /\b(einkommen|umsatz|gewerbe)steuer\b|\bust[- ]?voranmeldung\b|\bvorauszahlung\b.*steuer/, "tax", "tax", 0.9, "Tax payment (from the reference)", { scope: "any" }),
  r("ksk", /\bkunstlersozialkasse\b|\bksk\b/, "tax", "health", 0.95, "Künstlersozialkasse contribution — goes to the tax advisor, not the expense list", { scope: "any" }),
  r("pension", /\brentenversicherung\b|\bdrv\b/, "tax", "health", 0.92, "Pension contribution — Sonderausgaben, not a business expense", { scope: "any" }),
  r("health-insurance", /\btechniker\b|\btk\b.*kranken|\baok\b|\bbarmer\b|\bdak\b|\bkkh\b|\bhek\b|\bbkk\b|\bikk\b|\bkrankenkasse\b|\bkrankenversicherung\b|\bottonova\b|\bhallesche\b|\bdebeka\b|\bhansemerkur\b|\bsbk\b|\bviactiv\b|\bmobil krankenkasse\b/, "tax", "health", 0.95, "Health insurance — Sonderausgaben, listed separately for the tax advisor", { scope: "any" }),

  // ── Software & AI (business) ─────────────────────────────────────────
  // "ADOBE *ADOBE" is the individual Stock plan; the team plan bills through WorldPay.
  r("adobe-stock", /adobe \*?adobe|\badobe stock\b/, "business", "assets", 0.95, "Adobe Stock"),
  r("adobe", /\badobe\b|\bworld ?pay\b/, "business", "software", 0.97, "Adobe Creative Cloud"),
  r("figma", /\bfigma\b/, "business", "software", 0.97, "Design software"),
  r("notion", /\bnotion\b/, "business", "software", 0.95, "Workspace software"),
  r("anthropic", /\banthropic\b|\bclaude\b/, "business", "software", 0.95, "AI tooling"),
  r("openai", /\bopenai\b|\bchatgpt\b/, "business", "software", 0.95, "AI tooling"),
  r("ai-tools", /\bmidjourney\b|\brunway\b|\bhiggsfield\b|\bkrea\b|\bmagnific\b|\bfreepik\b|\bleonardo\b|\bideogram\b|\bkling\b|\bluma\b|\bpika\b|\bhailuo\b|\bminimax\b|\belevenlabs\b|\breplicate\b|\bfal\.ai\b|\btopaz\b|\bheygen\b|\bsynthesia\b|\bperplexity\b|\bgemini\b|\bstability\b|\bhugging ?face\b|\bsuno\b|\budio\b|\bveo\b/, "business", "software", 0.93, "AI tooling"),
  r("lalal", /\blalal\b/, "business", "software", 0.95, "Audio stem separation"),
  r("atlassian", /\batlassian\b/, "business", "software", 0.93, "Loom (billed by Atlassian)"),
  r("video-tools", /\bdescript\b|\briverside\b|\bveed\b|\bkapwing\b|\bopus ?clip\b|\bsubmagic\b|\bframe\.?io\b|\bscreen studio\b|\brotato\b|\bcleanshot\b|\bloom\b/, "business", "software", 0.92, "Video / screen tooling"),
  r("motion-tools", /\baescripts\b|\baeplugins\b|\bmaxon\b|\bred giant\b|\bboris ?fx\b|\bcavalry\b|\brive\b|\blottie\b|\bspline\b|\bmocha\b|\bcinema ?4d\b|\bblender\b/, "business", "software", 0.95, "Motion design software"),
  r("design-tools", /\bcanva\b|\baffinity\b|\bserif\b|\bprocreate\b|\bsketch\b|\bzeplin\b|\binvision\b|\bmiro\b|\bmural\b|\bpitch\.com\b|\bgamma\b|\breadymag\b|\bframer\b|\bwebflow\b|\brelume\b|\b21st\b|\bmobbin\b/, "business", "software", 0.94, "Design software"),
  r("dev-tools", /\bvercel\b|\bsanity\b|\bgithub\b|\bgitlab\b|\bcursor\b|\bjetbrains\b|\braycast\b|\bsetapp\b|\b1password\b|\bsupabase\b|\bnetlify\b|\brender\.com\b|\brailway\b|\bfly\.io\b|\bresend\b|\btwilio\b|\bpostmark\b|\bsendgrid\b|\blinear\b|\bwarp\b/, "business", "software", 0.95, "Developer tooling"),
  r("google-workspace", /\bgoogle\b.*(workspace|cloud|gsuite|g suite|domains)/, "business", "software", 0.95, "Google Workspace / Cloud"),
  r("apple-dev", /\bapple\b.*developer/, "business", "software", 0.95, "Apple Developer Program"),
  r("collab-tools", /\bslack\b|\bzoom\b|\bdropbox\b|\bwetransfer\b|\bcalendly\b|\bcal\.com\b|\btypeform\b|\bjotform\b|\btactiq\b|\bamie\b|\botter\b|\bgrammarly\b|\bdeepl\b|\bmicrosoft 365\b|\boffice 365\b|\bbackblaze\b/, "business", "software", 0.92, "Work tooling"),
  r("bookkeeping", /\blexoffice\b|\bsevdesk\b|\baccountable\b|\bkontist\b|\bsorted\b|\bfastbill\b|\bdebitoor\b|\bbuchhaltung\b/, "business", "services", 0.93, "Bookkeeping software"),

  // ── Web, domains, hosting (business) ─────────────────────────────────
  r("aws", /\bamazon web\b|\baws\b/, "business", "web", 0.95, "Cloud hosting"),
  r("domains", /\bnamecheap\b|\bgodaddy\b|\bcloudflare\b|\bporkbun\b|\bhetzner\b|\bdigitalocean\b|\bionos\b|\bstrato\b|\ball-?inkl\b|\bunited domains\b|\binwx\b|\bsquarespace\b|\bwix\b|\bcargo collective\b|\bcargo\.site\b|\bdomain\b|\bhosting\b|\bdns\b/, "business", "web", 0.93, "Domain or hosting", { scope: "any" }),

  // ── Marketing (business) ─────────────────────────────────────────────
  r("ads", /\b(meta|facebook|instagram|google|tiktok|linkedin|microsoft) ?ads\b|\badwords\b|\bfacebk\b|\bmeta platforms\b/, "business", "marketing", 0.95, "Advertising"),
  r("mailchimp", /\bmailchimp\b|\bconvertkit\b|\bkit\.com\b|\bbeehiiv\b|\bsubstack\b.*(pro|plan)/, "business", "marketing", 0.92, "Newsletter tooling"),
  r("portfolio-sites", /\blinkedin\b|\bbehance\b|\bdribbble\b|\bawwwards\b|\bsiteinspire\b/, "business", "marketing", 0.85, "Professional network / showcase"),

  // ── Office, coworking, supplies (business) ───────────────────────────
  r("coworking", /\bbetahaus\b|\bwework\b|\bmindspace\b|\bfactory berlin\b|\boberholz\b|\bregus\b|\bcowork/, "business", "office", 0.93, "Coworking"),
  r("office-supply", /\bmodulor\b|\bboesner\b|\bstaples\b|\bviking\b|\bburomarkt\b|\bbottcher\b|\bmcpaper\b|\bpapier\b/, "business", "office", 0.8, "Office / art supplies — business if it's for work"),
  r("ikea", /\bikea\b/, "unsure", "office", 0.4, "IKEA: desk for the studio or a lamp for the flat?"),

  // ── Hardware ─────────────────────────────────────────────────────────
  r("wacom", /\bwacom\b|\belgato\b|\blogitech\b|\bkeychron\b|\bcaldigit\b|\bsandisk\b|\bsamsung t7\b|\blacie\b|\bwestern digital\b|\bseagate\b/, "business", "hardware", 0.88, "Work hardware"),
  r("apple-store", /\bapple\b.*(store|retail|online)|\bapple store\b/, "unsure", "hardware", 0.6, "Apple hardware: business if it's for work"),
  r("electronics", /\bmediamarkt\b|\bmedia markt\b|\bsaturn\b|\bgravis\b|\bcyberport\b|\bnotebooksbilliger\b|\balternate\b|\bmindfactory\b|\bconrad\b|\bthomann\b|\bcalumet\b|\bfoto ?koch\b|\bb&h\b|\bcoolblue\b/, "unsure", "hardware", 0.55, "Electronics store: cable for the studio or headphones for the couch?"),

  // ── Bank & payment fees ──────────────────────────────────────────────
  r("n26-fee", /\bn26\b/, "business", "fees", 0.85, "Account fee"),
  r("wise-fee", /\bwise\b|\btransferwise\b/, "unsure", "fees", 0.6, "Wise: a fee (business) or moving your own money (skip)?", { scope: "any" }),
  r("stripe", /\bstripe\b/, "unsure", "fees", 0.6, "Stripe: platform fee or a purchase billed via Stripe?", { passthrough: true }),
  r("paypal", /\bpaypal\b/, "unsure", "other", 0.4, "PayPal: the reference usually names the real merchant", { passthrough: true }),
  r("klarna", /\bklarna\b/, "unsure", "other", 0.4, "Klarna: what was the order?", { passthrough: true }),
  r("sumup", /\bsumup\b|\bzettle\b|\bsquare\b/, "unsure", "other", 0.4, "Card terminal — which shop?", { passthrough: true }),

  // ── Insurance ────────────────────────────────────────────────────────
  r("liability", /\bberufshaftpflicht\b|\bhiscox\b|\bexali\b|\bmarkel\b|\bhaftpflicht\b.*(beruf|business)/, "business", "insurance", 0.9, "Professional liability insurance", { scope: "any" }),
  r("insurance", /\ballianz\b|\bhuk\b|\bergo\b|\baxa\b|\bgenerali\b|\bzurich\b|\bsignal iduna\b|\blvm\b|\bdevk\b|\bwgv\b|\bcosmos\b|\bgetsafe\b|\blemonade\b|\bclark\b|\bfeather\b|\bhaftpflicht\b|\bversicherung\b/, "unsure", "insurance", 0.5, "Insurance: professional (business) or private (personal)?", { scope: "any" }),

  // ── Professional services ────────────────────────────────────────────
  r("tax-advisor", /\bsteuerberat\b|\bsteuerberater\b|\btax advisor\b|\bsteuerkanzlei\b|\btaxfix\b|\bwundertax\b|\bsmartsteuer\b/, "business", "services", 0.9, "Tax advice", { scope: "any" }),
  r("chamber", /\bihk\b|\bhandelskammer\b|\bhandelsregister\b|\bgewerbeamt\b|\bamtsgericht\b/, "business", "services", 0.85, "Chamber / registry fee", { scope: "any" }),
  r("legal", /\banwalt\b|\brechtsanwalt\b|\bnotar\b|\bkanzlei\b|\blegal\b/, "unsure", "services", 0.6, "Legal: contract work (business) or private matter?", { scope: "any" }),

  // ── Telecom (partial use — you decide) ───────────────────────────────
  r("telecom", /\btelekom\b|\bvodafone\b|\bo2\b|\btelefonica\b|\b1&1\b|\b1und1\b|\bcongstar\b|\baldi talk\b|\bpyur\b|\beazy\b|\bnetcologne\b|\bm-net\b|\bfreenet\b|\bsim\.de\b|\bfraenk\b|\blebara\b|\blidl connect\b|\bdrillisch\b/, "unsure", "telecom", 0.6, "Phone / internet: often partly deductible — decide once, it remembers"),

  // ── Personal: groceries, drugstores, home ────────────────────────────
  r("groceries", /\brewe\b|\bedeka\b|\blidl\b|\baldi\b|\bpenny\b|\bnetto\b|\bkaufland\b|\bbio ?company\b|\bdenn'?s\b|\balnatura\b|\blpg\b|\bbasic\b|\bsupermarkt\b|\bmarkt\b|\bspati\b|\bspaeti\b|\bkiosk\b|\bgetranke\b|\bhofer\b|\bnah ?und ?gut\b|\bnahkauf\b|\bfeinkost\b|\bbackerei\b|\bbaeckerei\b|\bbakery\b|\bwochenmarkt\b/, "personal", "personal", 0.96, "Groceries"),
  r("drugstore", /\bdm\b|\bdm-?drogerie\b|\brossmann\b|\bmu?e?ller\b.*(drogerie|ltd|handels|kg)|\bbudni\b|\bapotheke\b|\bpharmacy\b|\bdocmorris\b|\bshop apotheke\b/, "personal", "personal", 0.96, "Drugstore / pharmacy"),
  r("delivery", /\blieferando\b|\bwolt\b|\buber ?eats\b|\bgorillas\b|\bflink\b|\bgetir\b|\bhellofresh\b|\bmarley ?spoon\b|\bdeliveroo\b|\bfoodora\b|\bknuspr\b|\bpicnic\b/, "personal", "personal", 0.95, "Food delivery"),
  r("rent", /\bmiete\b|\brent\b|\bhausverwaltung\b|\bgewobag\b|\bdegewo\b|\bhowoge\b|\bvonovia\b|\bdeutsche wohnen\b|\bberlinovo\b|\bstadt und land\b|\bwbm\b|\bwohnung\b|\bnebenkosten\b|\bkaution\b/, "personal", "personal", 0.9, "Rent — home-office share is a separate calculation for the tax advisor", { scope: "any" }),
  r("utilities", /\bvattenfall\b|\bgasag\b|\be\.?on\b|\benbw\b|\bnaturstrom\b|\blichtblick\b|\bpolarstern\b|\boctopus\b|\btibber\b|\bstromio\b|\bwasserbetriebe\b|\bbwb\b|\bstrom\b|\bgas\b|\brundfunk\b|\bard zdf\b|\bgez\b/, "personal", "personal", 0.92, "Utilities / broadcasting fee", { scope: "any" }),

  // ── Personal: entertainment, fitness, shopping ───────────────────────
  r("streaming", /\bnetflix\b|\bspotify\b|\bdisney\b|\bhbo\b|\bsky\b|\bdazn\b|\bprime video\b|\bamazon prime\b|\bapple tv\b|\bapple music\b|\byoutube\b|\btwitch\b|\bsteam\b|\bplaystation\b|\bnintendo\b|\bxbox\b|\bcrunchyroll\b|\bmubi\b|\bparamount\b|\bwow\b|\bdeezer\b|\btidal\b|\bsoundcloud\b|\bbandcamp\b/, "personal", "personal", 0.9, "Streaming / entertainment"),
  r("going-out", /\bkino\b|\bcinema\b|\byorck\b|\bcinemaxx\b|\buci\b|\beventim\b|\bticketmaster\b|\bresident advisor\b|\bra\.co\b|\bdice\b|\bberghain\b|\bclub\b|\btheater\b|\btheatre\b|\bkonzert\b|\bconcert\b|\bmuseum\b/, "personal", "personal", 0.88, "Going out"),
  r("fitness", /\burban sports\b|\bmcfit\b|\bfitx\b|\bjohn reed\b|\bclasspass\b|\bpeloton\b|\byoga\b|\bgym\b|\bfitness\b|\bschwimm|\bsauna\b|\bboulder\b|\bkletter/, "personal", "personal", 0.93, "Fitness"),
  r("health", /\bzahnarzt\b|\barzt\b|\bpraxis\b|\bphysio\b|\boptiker\b|\bfielmann\b|\bapollo\b|\bmister spex\b|\btherap|\bklinik\b|\bkrankenhaus\b|\bdoctolib\b/, "personal", "personal", 0.93, "Health"),
  r("clothes", /\bzalando\b|\bh&m\b|\bh & m\b|\bzara\b|\buniqlo\b|\basos\b|\babout you\b|\bnike\b|\badidas\b|\bc&a\b|\bprimark\b|\bcos\b|\barket\b|\bweekday\b|\burban outfitters\b|\bsnipes\b|\bfoot locker\b|\bdecathlon\b|\bglobetrotter\b|\bmango\b|\bbershka\b|\bmassimo dutti\b|\bvinted\b|\bpull&bear\b|\blevi'?s\b|\bcarhartt\b|\bpatagonia\b|\bbirkenstock\b|\bdr\.? martens\b/, "personal", "personal", 0.95, "Clothes"),
  r("restaurants", /\brestaurant\b|\bcafe\b|\bcaffe\b|\bcoffee\b|\bkaffee\b|\broster|\bbar\b|\bpizza\b|\bpizzeria\b|\bsushi\b|\bburger\b|\bkebab\b|\bdoner\b|\bdoener\b|\bimbiss\b|\bbistro\b|\bkitchen\b|\beatery\b|\bramen\b|\bthai\b|\bvietnam|\bindian\b|\bgrill\b|\bbrauhaus\b|\bweinbar\b|\bcocktail\b|\bpub\b|\bdeli\b|\bbrunch\b|\bfood\b|\bfalafel\b|\btaco\b|\bmexican\b|\bitalian\b|\bwein\b|\bbier\b|\bbeer\b|\bespresso\b|\bbrew\b|\bgelato\b|\beis\b|\bice ?cream\b|\bkantine\b|\bcanteen\b|\bmensa\b|\bbowl\b|\bnoodle\b|\bdumpling\b|\bpho\b|\bbanh mi\b|\bcurry\b|\bwurst\b|\bbrot\b|\bcroissant\b|\bpatisserie\b|\bkonditorei\b|\bsnack\b|\bfive guys\b|\bmcdonald|\bburger king\b|\bkfc\b|\bsubway\b|\bstarbucks\b|\bdean ?& ?david\b|\bvapiano\b|\bbeets ?& ?roots\b/, "personal", "personal", 0.88, "Food & drink — business only if it was a client meeting (then 70% counts)"),
  r("home", /\bbauhaus\b|\bobi\b|\bhornbach\b|\btoom\b|\bhagebau\b|\bleroy\b|\bbutlers\b|\bdepot\b|\bwestwing\b|\bhome24\b|\bwayfair\b|\bmade\.com\b|\bblumen\b|\bflorist\b|\bfleurop\b|\bnanu ?nana\b|\btedi\b|\bwoolworth\b|\baction\b|\bflying tiger\b/, "personal", "personal", 0.88, "Home & garden"),
  r("kids-pets", /\bkita\b|\bkindergarten\b|\bschule\b|\bfressnapf\b|\bzooplus\b|\btierarzt\b|\bvet\b/, "personal", "personal", 0.95, "Family / pets"),
  r("charity", /\bspende\b|\bdonation\b|\bwikimedia\b|\bunicef\b|\bmsf\b|\barzte ohne grenzen\b|\bgreenpeace\b|\bwwf\b/, "personal", "personal", 0.9, "Donation — Sonderausgabe, not a business expense", { scope: "any" }),

  // ── Cash ─────────────────────────────────────────────────────────────
  r("atm", /\batm\b|\bcash\b|\bbargeld\b|\bgeldautomat\b|\bwithdrawal\b|\babhebung\b/, "personal", "personal", 0.9, "Cash withdrawal — only receipts count, add those by hand", { scope: "any" }),

  // ── Shipping ─────────────────────────────────────────────────────────
  r("shipping", /\bdeutsche post\b|\bdhl\b|\bhermes\b|\bups\b|\bfedex\b|\bdpd\b|\bgls\b|\bpackstation\b|\bpostfiliale\b/, "unsure", "office", 0.5, "Shipping: client deliverable or a personal parcel?"),

  // ── Travel & transport (you decide) ──────────────────────────────────
  r("airlines", /\blufthansa\b|\bryanair\b|\beasyjet\b|\beurowings\b|\bwizz\b|\bklm\b|\bair france\b|\bvueling\b|\btap\b|\bbritish airways\b|\bcondor\b|\btui\b|\bswiss (int|air)|\bomio\b|\bskyscanner\b|\bkiwi\.com\b/, "unsure", "travel", 0.5, "Flight: client trip or holiday?"),
  r("rail", /\bdeutsche bahn\b|\bdb vertrieb\b|\bdb fernverkehr\b|\bbahn\b|\bflixbus\b|\bflixtrain\b|\bsncf\b|\btrainline\b|\beurostar\b|\bthalys\b/, "unsure", "travel", 0.5, "Train / bus: client trip or personal?"),
  r("lodging", /\bairbnb\b|\bbooking\.com\b|\bbooking com\b|\bhotels?\b|\bhostel\b|\bexpedia\b|\bhrs\b|\bmarriott\b|\bhilton\b|\bmotel one\b|\b25hours\b/, "unsure", "travel", 0.5, "Lodging: client trip or holiday?"),
  r("local-transport", /\bbvg\b|\bs-?bahn\b|\bvbb\b|\bmvg\b|\bhvv\b|\brmv\b|\bdeutschlandticket\b/, "unsure", "travel", 0.5, "Public transport: business trips only, or leave it out"),
  r("rides", /\buber\b|\bbolt\b|\bfree ?now\b|\btaxi\b|\bmiles\b|\bsixt\b|\bshare ?now\b|\bgetaround\b|\blime\b|\btier\b|\bvoi\b|\bnextbike\b/, "unsure", "travel", 0.5, "Ride: to a client or out with friends?"),
  r("fuel", /\bshell\b|\baral\b|\btotal ?energies\b|\btotal\b|\besso\b|\bjet\b|\btankstelle\b/, "unsure", "travel", 0.45, "Fuel: business trip?"),
  r("bike-sub", /\bswapfiets\b|\bdance\b/, "personal", "personal", 0.85, "Bike subscription"),

  // ── Assets: fonts, plugins, stock (business) ─────────────────────────
  r("fonts", /\bmyfonts\b|\bfonts\.com\b|\bmonotype\b|\bfontstand\b|\bfontspring\b|\bfontshare\b|\bklim\b|\bpangram\b|\bdinamo\b|\bcolophon\b|\batipo\b|\bcommercial type\b|\bgrilli\b|\btypotheque\b|\bfuture fonts\b|\bfont ?werk\b|\bswiss ?typefaces\b|\btype ?network\b|\bfoundry\b|\btypefaces?\b|\bfonts?\b/, "business", "assets", 0.93, "Typeface licence", { scope: "any" }),
  r("stock", /\benvato\b|\bmotion ?array\b|\bartlist\b|\bartgrid\b|\bepidemic sound\b|\bmusicbed\b|\bstoryblocks\b|\bshutterstock\b|\bistock\b|\bgetty\b|\bpond5\b|\bvideohive\b|\bunsplash\b|\bpexels\b|\bsoundstripe\b|\buppbeat\b|\bstock\b/, "business", "assets", 0.93, "Stock footage / music / images", { scope: "any" }),
  r("plugins", /\bplugin\b|\bpreset\b|\beditingvisuals\b|\bediting visuals\b|\bmotion design school\b|\bvideocopilot\b|\bvideo copilot\b/, "business", "assets", 0.9, "Plugin or preset", { scope: "any" }),
  r("gumroad", /\bgumroad\b|\blemon ?squeezy\b|\bpaddle\b|\bcreative market\b|\bblender market\b|\bsuperhi\b/, "unsure", "assets", 0.6, "Digital storefront — usually a creative asset, sometimes not"),

  // ── Print & production (business) ────────────────────────────────────
  r("print", /\bprintdeal\b|\bflyeralarm\b|\bwir ?machen ?druck\b|\bsaxoprint\b|\bonlineprinters\b|\bvistaprint\b|\bmoo\b|\bdruck\b|\bcopyshop\b|\bcopy shop\b|\bprint(ing|shop)?\b/, "business", "production", 0.9, "Print job — likely a client pass-through", { scope: "any" }),

  // ── Education ────────────────────────────────────────────────────────
  r("courses", /\bdomestika\b|\bskillshare\b|\bcoursera\b|\budemy\b|\bschool of motion\b|\bmotion design school\b|\bawwwards academy\b|\bmasterclass\b|\bo'?reilly\b|\bfrontend masters\b|\bworkshop\b|\bcourse\b|\bkurs\b/, "business", "education", 0.88, "Course or workshop", { scope: "any" }),
  r("books", /\bthalia\b|\bdussmann\b|\bhugendubel\b|\bbookshop\b|\bbuchhandlung\b|\bkindle\b|\baudible\b|\bmedium\b|\bsubstack\b|\bpatreon\b/, "unsure", "education", 0.5, "Books / media: design reference or bedtime reading?"),
  r("events", /\beventbrite\b|\bmeetup\b|\bluma\b|\bconference\b|\bkonferenz\b|\bsummit\b|\bfestival\b/, "unsure", "education", 0.5, "Event ticket: industry event or a night out?", { scope: "any" }),

  // ── Big ambiguous marketplaces ───────────────────────────────────────
  r("amazon-prime", /\bamazon\b.*(prime|music|video)|\bamzn\b.*prime|\bprime membership\b/, "personal", "personal", 0.9, "Amazon Prime"),
  r("amazon", /\bamazon\b|\bamzn\b/, "unsure", "other", 0.4, "Amazon: could be a book, a cable, or socks — check the order"),
  r("ebay", /\bebay\b|\betsy\b|\bkleinanzeigen\b|\btemu\b|\baliexpress\b|\bwish\b/, "unsure", "other", 0.4, "Marketplace order — what was it?"),
  r("google-play", /\bgoogle\b/, "unsure", "software", 0.5, "Google billing: check which app or service", { passthrough: true }),
  r("apple-services", /\bapple\b|\bitunes\b/, "unsure", "software", 0.5, "Apple: iCloud / app subscription (business?) or Music / TV (personal)?", { passthrough: true }),
  r("microsoft", /\bmicrosoft\b/, "unsure", "software", 0.6, "Microsoft: Office (business) or Xbox (personal)?"),
];
