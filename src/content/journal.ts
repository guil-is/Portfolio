// Journal post data. Empty by default — the Webflow export didn't
// include real journal entries (journal.html was the Akin template
// leftover). Add entries here to populate /journal/[slug] routes.

export type JournalPost = {
  slug: string;
  title: string;
  date: string; // ISO date
  summary?: string;
  heroImage?: string;
  body: string; // simple HTML or markdown-ish string
};

export const journalPosts: JournalPost[] = [];
