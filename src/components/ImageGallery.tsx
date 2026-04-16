import Image from "next/image";

type Props = {
  images: string[];
  alt: string;
};

// Horizontal scroll-snap gallery. Each slide is ~85% of viewport on mobile
// (peek the next one) and ~66% on desktop. Scrollbar hidden via .scroll-row
// utility already defined in globals.css.
export function ImageGallery({ images, alt }: Props) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-[16px] border border-dashed border-rule bg-card/30">
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          Images coming
        </p>
      </div>
    );
  }

  return (
    <div className="scroll-row -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:-mx-10 md:gap-6 md:px-10">
      {images.map((src, i) => (
        <div
          key={src}
          className="relative aspect-[16/9] w-[85%] shrink-0 snap-start overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433] md:w-[66%]"
        >
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            sizes="(min-width: 768px) 640px, 85vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
