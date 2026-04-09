import { Section } from "./Section";
import { site } from "@/content/site";

function ChatBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-background/60 text-sm">
        <span aria-hidden>{"\uD83D\uDC4B"}</span>
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-background/60 px-4 py-2.5 text-sm text-foreground/90">
        {text}
      </div>
    </div>
  );
}

export function Contact() {
  const mailto = (q: string) =>
    `mailto:${site.email}?subject=${encodeURIComponent(q)}`;

  return (
    <Section id="contact" label="Contact">
      <div className="flex min-h-[420px] flex-col justify-between gap-6 rounded-3xl bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <ChatBubble text={site.contact.greeting} />
        </div>

        <div className="flex flex-col gap-3">
          <ul className="flex flex-col items-end gap-2">
            {site.contact.suggestions.map((q) => (
              <li key={q}>
                <a
                  href={mailto(q)}
                  className="inline-flex max-w-[min(420px,100%)] items-center rounded-2xl rounded-tr-sm border border-border/80 bg-background/40 px-4 py-2.5 text-right text-sm text-foreground/90 transition-colors hover:border-border hover:bg-background/60"
                >
                  {q}
                </a>
              </li>
            ))}
          </ul>

          <form
            action={`mailto:${site.email}`}
            method="post"
            encType="text/plain"
            className="mt-2 flex items-center gap-2 rounded-2xl border border-border/80 bg-background/40 px-4 py-3"
          >
            <label htmlFor="contact-message" className="sr-only">
              Message
            </label>
            <input
              id="contact-message"
              name="message"
              type="text"
              placeholder="Message…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </Section>
  );
}
