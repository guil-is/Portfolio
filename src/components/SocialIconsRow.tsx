import type { Social } from "@/content/site";
import {
  TwitterIcon,
  LinkedinIcon,
  InstagramIcon,
  ReadCvIcon,
} from "./icons/Social";

const iconMap = {
  twitter: TwitterIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  readcv: ReadCvIcon,
} as const;

type SocialIconsRowProps = {
  socials: readonly Social[];
  className?: string;
};

// Matches `.social-icons` / `.social-link-block` from the Webflow export:
// horizontal row, 14px icon height, opacity 0.5 → 1 on hover, label beside icon.
export function SocialIconsRow({ socials, className = "" }: SocialIconsRowProps) {
  return (
    <div className={`flex flex-wrap items-center gap-6 ${className}`}>
      {socials.map((s) => {
        const Icon = iconMap[s.icon];
        return (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-ink opacity-50 transition-opacity hover:opacity-100"
          >
            <Icon className="h-[14px] w-[14px]" />
            <span className="text-[0.9rem] leading-[1.5rem]">{s.label}</span>
          </a>
        );
      })}
    </div>
  );
}
