import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

type CtaButtonProps = {
  href: string;
  label: string;
  className?: string;
  external?: boolean;
  /** Optional icon override for the dark circle. Defaults to ArrowUpRight,
   * which also gets the subtle -45° rotate on hover. Custom icons render
   * static (no rotation) since that motion vocabulary is arrow-specific. */
  icon?: LucideIcon;
};

// Pill CTA matching the Webflow `.cta-button` / `.button4_*` structure.
//
// Default state: transparent pill with a visible 56px dark circle on the
// left (drawn by the `.cta-pill::before` pseudo-element via globals.css)
// and the ink-colored label to its right.
//
// Hover: the dark ::before expands from 56px to 100% width, turning the
// pill dark, and the label color flips to the page background color.
export function CtaButton({
  href,
  label,
  className = "",
  external = true,
  icon,
}: CtaButtonProps) {
  const Comp = external ? "a" : Link;
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  const Icon = icon ?? ArrowUpRight;
  const iconAnimates = !icon;

  return (
    <Comp
      href={href}
      {...externalProps}
      className={`cta-pill group inline-flex h-14 items-center gap-4 pr-6 ${className}`}
    >
      <span className="flex h-14 w-14 items-center justify-center text-bg">
        <Icon
          className={`h-5 w-5${iconAnimates ? " transition-transform duration-500 group-hover:-rotate-45" : ""}`}
          strokeWidth={2}
        />
      </span>
      <span className="font-caption text-[13px] font-bold uppercase tracking-[1px]">
        {label}
      </span>
    </Comp>
  );
}
