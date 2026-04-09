// CSS-only replacement for the Webflow Lottie dot next to the
// "recent / active projects" heading. No runtime Lottie dependency.
export function PulsingDot({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pulse-dot inline-block h-2.5 w-2.5 rounded-full bg-accent ${className}`}
    />
  );
}
