type VideoEmbedProps = {
  url: string;
  title?: string;
  className?: string;
};

// Parse a YouTube or Vimeo URL and return the iframe embed src.
// Returns null if the URL isn't recognized — caller falls back to a link.
function toEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // YouTube (full watch URL)
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // YouTube short URL
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Vimeo
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    // invalid URL
  }
  return null;
}

export function VideoEmbed({ url, title, className = "" }: VideoEmbedProps) {
  const src = toEmbedSrc(url);

  if (!src) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 text-accent underline underline-offset-4 ${className}`}
      >
        {title ?? "Watch video"} ↗
      </a>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-[16px] bg-card shadow-[0_4px_40px_#cfc8c433] ${className}`}
      style={{ aspectRatio: "16 / 9" }}
    >
      <iframe
        src={src}
        title={title ?? "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
