type PlaceholderProps = {
  label: string;
  aspect?: "square" | "video" | "portrait";
  className?: string;
};

// Deterministic tinted card used where real images aren't available yet.
// Reproduces the `.content-image` look: 16px radius, soft card background,
// subtle shadow. The label is rendered inside so the real content intent
// is obvious, and swapping for a real image later is a one-line change.
function tintFor(label: string) {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) & 0xffffff;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 32%, 78%)`;
}

const aspectClass = {
  square: "aspect-square",
  video: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
} as const;

export function Placeholder({
  label,
  aspect = "square",
  className = "",
}: PlaceholderProps) {
  const tint = tintFor(label);
  return (
    <div
      className={`relative w-full overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433] ${aspectClass[aspect]} ${className}`}
      style={{ backgroundColor: tint }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <span className="font-display text-center text-xl font-bold text-ink/70">
          {label}
        </span>
      </div>
    </div>
  );
}
