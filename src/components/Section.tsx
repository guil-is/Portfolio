import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
  contentClassName = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`w-full border-t border-border/60 py-24 sm:py-32 ${className}`}
    >
      <div className="mx-auto w-full max-w-5xl px-6">
        {(eyebrow || title) && (
          <header className="mb-12 flex flex-col gap-3">
            {eyebrow && (
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
          </header>
        )}
        <div className={contentClassName}>{children}</div>
      </div>
    </section>
  );
}
