import { site } from "@/content/site";

export function Footer() {
  return (
    <footer className="w-full py-12">
      <p className="text-center text-xs uppercase tracking-[0.15em] text-muted">
        &copy; Copyright {new Date().getFullYear()} {site.name}
      </p>
    </footer>
  );
}
