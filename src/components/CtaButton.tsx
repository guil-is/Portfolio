import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

type CommonProps = {
  label: string;
  className?: string;
  /** Optional icon override for the dark circle. Defaults to ArrowUpRight,
   * which also gets the subtle -45° rotate on hover. Custom icons render
   * static (no rotation) since that motion vocabulary is arrow-specific. */
  icon?: LucideIcon;
};

/** Link variant (default) — navigates to `href`. */
type CtaLinkProps = CommonProps & {
  href: string;
  external?: boolean;
};

/** Action variant — renders a <button> for forms / onClick handlers while
 * keeping the exact same pill structure and hover behavior. */
type CtaActionProps = CommonProps & {
  type: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

type CtaButtonProps = CtaLinkProps | CtaActionProps;

// Pill CTA matching the Webflow `.cta-button` / `.button4_*` structure.
//
// Default state: transparent pill with a visible 56px dark circle on the
// left (drawn by the `.cta-pill::before` pseudo-element via globals.css)
// and the ink-colored label to its right.
//
// Hover: the dark ::before expands from 56px to 100% width, turning the
// pill dark, and the label color flips to the page background color.
export function CtaButton(props: CtaButtonProps) {
  const { label, className = "", icon } = props;
  const Icon = icon ?? ArrowUpRight;
  const iconAnimates = !icon;

  const inner = (
    <>
      <span className="flex h-14 w-14 items-center justify-center text-bg">
        <Icon
          className={`h-5 w-5${iconAnimates ? " transition-transform duration-500 group-hover:-rotate-45" : ""}`}
          strokeWidth={2}
        />
      </span>
      <span className="font-caption text-[13px] font-bold uppercase tracking-[1px]">
        {label}
      </span>
    </>
  );

  const baseClass = `cta-pill group inline-flex h-14 items-center gap-4 pr-6 ${className}`;

  if ("type" in props) {
    return (
      <button
        type={props.type}
        onClick={props.onClick}
        disabled={props.disabled}
        className={`${baseClass} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {inner}
      </button>
    );
  }

  const external = props.external ?? true;
  const Comp = external ? "a" : Link;
  const externalProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Comp href={props.href} {...externalProps} className={baseClass}>
      {inner}
    </Comp>
  );
}
