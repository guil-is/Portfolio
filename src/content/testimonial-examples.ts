/**
 * A bank of anonymous example testimonials. Used at
 * /testimonial-examples as a starting point for real endorsers who
 * freeze on "what do I write?". Each entry has a short angle tag so
 * skimmers can find the framing that applies to them.
 *
 * These aren't real quotes and shouldn't be presented as if they were
 * — the page is explicitly labelled as examples.
 */
export type TestimonialExample = {
  /** Short tag describing what the example emphasises, e.g.
   * "speed", "brand impact". Used for the small caption under each
   * card so the reader can find the angle that fits. */
  angle: string;
  quote: string;
};

export const testimonialExamples: TestimonialExample[] = [
  {
    angle: "Speed of delivery",
    quote:
      "Guil turns around in a week what most agencies quote for a month. The work is polished, the back-and-forth is minimal, and the invoices make sense.",
  },
  {
    angle: "Strategic thinking",
    quote:
      "I came to Guil for a visual refresh and left with a clearer understanding of my own business. He asked questions I hadn't asked myself, then made the answers show up in the design.",
  },
  {
    angle: "Collaboration style",
    quote:
      "Working with Guil felt like having a design cofounder for the duration. He pushed back when it mattered, got out of the way when it didn't, and left the brand in better shape than he found it.",
  },
  {
    angle: "Craft and taste",
    quote:
      "Every deliverable lands a notch higher than what I asked for. Guil's taste is strong enough that I stopped second-guessing his choices early on.",
  },
  {
    angle: "Low friction",
    quote:
      "Briefed once, shipped right. Guil doesn't need hand-holding and doesn't waste a call on things that should be a message. Rare combination.",
  },
  {
    angle: "Brand impact",
    quote:
      "Our brand finally feels like us. Guil found the version of the identity that was already there and sharpened it until customers started noticing.",
  },
  {
    angle: "Versatility",
    quote:
      "Guil designed our landing page, overhauled the pitch deck, and ended up helping us rewrite the pricing page copy. One person, three wins.",
  },
  {
    angle: "Reliability",
    quote:
      "The kind of designer you hand a brief to on Friday and get something great back Monday morning, on time, every time. I don't check in because I don't have to.",
  },
  {
    angle: "Working rhythm",
    quote:
      "Calm, funny, and never makes a meeting feel like a chore. Working with Guil is one of the few things on our roadmap I actually look forward to.",
  },
  {
    angle: "Hiring decision",
    quote:
      "We interviewed four agencies and hired Guil instead. Better work, half the price, no middle layer between us and the actual designer.",
  },
  {
    angle: "Business impact",
    quote:
      "The launch page Guil built converted 3× better than the one it replaced. Paid for the whole engagement in the first two days.",
  },
  {
    angle: "Iteration",
    quote:
      "Guil nailed the direction on the second round and moved with enough conviction that we didn't spend six weeks second-guessing it. Saved the team a lot of energy.",
  },
  {
    angle: "Design taste",
    quote:
      "Gives references, not mood boards. Knows the difference between what looks cool and what serves the product. I trust his taste implicitly.",
  },
  {
    angle: "Long-term partnership",
    quote:
      "We've worked with Guil for over a year. Every engagement has punched above its weight: brand, site, deck, launches. He's become a permanent part of how we ship.",
  },
  {
    angle: "Full team in one",
    quote:
      "Working with Guil felt like hiring a full design team in one person. He saw the whole system on day one: the brand, the product, and the story we were trying to tell. He moved all three forward at once.",
  },
  {
    angle: "Low ego",
    quote:
      "Sharp instincts, fast hands, zero ego. Guil ships polished work without the typical freelance friction. Briefs get met, edges get found, the bar keeps going up.",
  },
  {
    angle: "Why before how",
    quote:
      "Guil's the rare designer who cares as much about why something exists as how it looks. Every call ended with us understanding our own product better.",
  },
  {
    angle: "Team favorite",
    quote:
      "I've worked with a lot of contractors. Guil is the only one my team asks for by name. His taste is strong and his output speaks for itself.",
  },
  {
    angle: "Knows when to push",
    quote:
      "What I appreciated most: he pushed back when it mattered and got out of the way when it didn't. Shipped faster than any team I'd worked with.",
  },
];
