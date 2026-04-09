import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  label?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

// Two-column layout used across most sections:
//   [ label on the left ] [ main content on the right ]
// On small screens the label stacks above the content.
export function Section({
  id,
  label,
  action,
  children,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`w-full scroll-mt-24 px-4 py-16 sm:px-8 sm:py-20 ${className}`}
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-6 md:grid-cols-[160px_1fr] md:gap-10">
          <div className="flex items-start justify-between gap-4">
            {label && (
              <span className="text-sm font-medium text-muted">{label}</span>
            )}
            {action && <div className="md:hidden">{action}</div>}
          </div>
          <div className="min-w-0">
            {action && (
              <div className="mb-4 hidden justify-end md:flex">{action}</div>
            )}
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

// Full-bleed section (no inner two-column grid) — used for hero and
// horizontal-scrolling rows that want to bleed off the right edge.
export function BleedSection({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`w-full scroll-mt-24 py-10 sm:py-14 ${className}`}
    >
      {children}
    </section>
  );
}
