import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type CtaButtonProps = {
  href: string;
  label: string;
  className?: string;
  external?: boolean;
};

// Pill CTA with a left circle containing an arrow icon and uppercase label
// text. Matches the `.cta-button` / `.button4_*` pattern from the Webflow
// export: 3.5em tall, 16px radius, #161616 circle + text row.
export function CtaButton({
  href,
  label,
  className = "",
  external = true,
}: CtaButtonProps) {
  const Comp = external ? "a" : Link;
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Comp
      href={href}
      {...externalProps}
      className={`group relative inline-flex h-14 items-center gap-4 overflow-hidden rounded-[16px] bg-dark pr-6 text-dark-contrast transition-opacity hover:opacity-90 ${className}`}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-dark text-dark-contrast">
        <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className="font-caption text-[13px] font-bold uppercase tracking-[1px]">
        {label}
      </span>
    </Comp>
  );
}
