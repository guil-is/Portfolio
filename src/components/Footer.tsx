import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-2 px-6 py-10 text-sm text-muted sm:flex-row sm:items-center">
        <span>
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </span>
        <span>Built with Next.js &amp; Tailwind CSS.</span>
      </div>
    </footer>
  );
}
