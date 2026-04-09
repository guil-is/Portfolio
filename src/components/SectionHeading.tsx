import type { ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
  className?: string;
};

// Replicates `.section-heading` from the Webflow export:
// Public Sans 13px/600, uppercase, 1.5px tracking, 1px top border,
// 800px max width, 16px padding-top / 16px margin-top.
export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <h6
      className={`flex items-center gap-3 max-w-[800px] border-t border-rule pt-4 mt-4 font-caption text-[13px] font-semibold uppercase tracking-[1.5px] text-ink ${className}`}
    >
      {children}
    </h6>
  );
}
