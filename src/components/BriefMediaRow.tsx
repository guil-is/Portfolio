"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import type { BriefMediaItem } from "@/content/proposals/types";

type Resolved =
  | { kind: "video"; item: BriefMediaItem; videoSrc: string }
  | { kind: "youtube"; item: BriefMediaItem; youtubeId: string; poster: string }
  | { kind: "link"; item: BriefMediaItem };

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      return u.pathname.replace(/^\//, "").split("/")[0] || null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      return u.searchParams.get("v");
    }
  } catch {
    // invalid URL
  }
  return null;
}

function platformLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "x.com" || host === "twitter.com") return "X";
    if (host === "instagram.com") return "Instagram";
    if (host.endsWith("youtube.com") || host === "youtu.be") return "YouTube";
    if (host.endsWith("vimeo.com")) return "Vimeo";
    return host;
  } catch {
    return "Link";
  }
}

function resolve(item: BriefMediaItem): Resolved {
  if (item.videoSrc) {
    return { kind: "video", item, videoSrc: item.videoSrc };
  }
  const id = youtubeId(item.url);
  if (id) {
    return {
      kind: "youtube",
      item,
      youtubeId: id,
      poster: item.poster ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }
  return { kind: "link", item };
}

export function BriefMediaRow({ items }: { items: BriefMediaItem[] }) {
  const resolved = items.map(resolve);
  const [openAt, setOpenAt] = useState(-1);

  type Playable = Extract<Resolved, { kind: "video" | "youtube" }>;
  const playable = resolved
    .map((r, i) => ({ r, i }))
    .filter(
      (entry): entry is { r: Playable; i: number } => entry.r.kind !== "link",
    );

  const slides: Slide[] = playable.map(({ r }) => {
    if (r.kind === "video") {
      return {
        type: "video",
        sources: [{ src: r.videoSrc, type: "video/mp4" }],
        autoPlay: true,
        controls: true,
        loop: true,
      } as Slide;
    }
    return {
      type: "youtube",
      id: r.youtubeId,
    } as unknown as Slide;
  });

  function openIndexFor(absoluteIndex: number): number {
    return playable.findIndex(({ i }) => i === absoluteIndex);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {resolved.map((r, i) => (
          <ReferenceTile
            key={r.item.url}
            resolved={r}
            onOpen={
              r.kind === "link" ? undefined : () => setOpenAt(openIndexFor(i))
            }
          />
        ))}
      </div>

      <Lightbox
        open={openAt >= 0}
        close={() => setOpenAt(-1)}
        slides={slides}
        index={openAt < 0 ? 0 : openAt}
        controller={{ closeOnBackdropClick: true }}
        animation={{ fade: 150, swipe: 180, navigation: 180 }}
        carousel={{ finite: true, preload: 1 }}
        plugins={[Video]}
        render={{
          slide: ({ slide }) => {
            if ((slide as { type?: string }).type === "youtube") {
              const id = (slide as unknown as { id: string }).id;
              return (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <iframe
                    src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
                    title="YouTube reference"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="aspect-video w-full max-w-[1280px]"
                  />
                </div>
              );
            }
            return undefined;
          },
        }}
      />
    </>
  );
}

function ReferenceTile({
  resolved,
  onOpen,
}: {
  resolved: Resolved;
  onOpen?: () => void;
}) {
  const { item } = resolved;
  const meta = (
    <div className="mt-3 flex flex-wrap items-baseline gap-x-3">
      <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-ink">
        {item.title}
      </p>
      <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
        {platformLabel(item.url)}
      </p>
    </div>
  );

  const preview = (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[12px] bg-card shadow-[0_4px_40px_#cfc8c433] dark:shadow-none">
      {resolved.kind === "video" ? (
        <video
          src={resolved.videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : resolved.kind === "youtube" ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolved.poster}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/85 text-bg shadow-[0_0_24px_rgba(0,0,0,0.35)] transition-transform group-hover:scale-105">
              <Play
                className="h-6 w-6 translate-x-0.5"
                strokeWidth={2}
                aria-hidden
              />
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
            {platformLabel(item.url)}
          </p>
        </div>
      )}
    </div>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group block w-full text-left"
      >
        {preview}
        {meta}
        {item.caption ? (
          <p className="mt-2 text-[0.9rem] leading-[1.5rem] text-muted">
            {item.caption}
          </p>
        ) : null}
      </button>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      {preview}
      {meta}
      {item.caption ? (
        <p className="mt-2 text-[0.9rem] leading-[1.5rem] text-muted">
          {item.caption}
        </p>
      ) : null}
    </a>
  );
}
