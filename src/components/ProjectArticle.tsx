import Image from "next/image";
import {
  PortableText,
  type PortableTextComponents,
} from "@portabletext/react";
import { VideoEmbed } from "./VideoEmbed";
import type {
  PortableTextBlock,
  SanityImageRef,
  SanityVideoEmbed,
} from "@/lib/queries";

/**
 * Renders the rich `projectDetails` body of a Sanity `project` document.
 *
 * The Sanity schema allows three block types inside projectDetails:
 *   - `block`   — standard rich text paragraphs, handled by the
 *                 default PortableText renderer.
 *   - `image`   — inline image with optional caption. Asset URL is
 *                 resolved in the GROQ query via asset->url so we
 *                 can pass it straight to next/image.
 *   - `videoEmbed` — YouTube or Vimeo URL with optional caption.
 *                    We delegate to the existing <VideoEmbed>
 *                    component which already handles URL parsing
 *                    and iframe sandboxing.
 *
 * The outer `.project-article` class is shared with the legacy HTML
 * body renderer so typographic styles apply to both paths.
 */

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const v = value as SanityImageRef;
      if (!v.url) return null;
      const caption =
        v.caption && v.caption !== "__wf_reserved_inherit"
          ? v.caption
          : undefined;
      return (
        <figure className="project-article-figure">
          <div className="relative w-full overflow-hidden rounded-[16px] bg-card">
            <Image
              src={v.url}
              alt={caption ?? ""}
              width={1600}
              height={1200}
              sizes="(min-width: 768px) 720px, 100vw"
              className="h-auto w-full object-contain"
            />
          </div>
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    },
    videoEmbed: ({ value }) => {
      const v = value as SanityVideoEmbed;
      if (!v.url) return null;
      return (
        <figure className="project-article-figure project-article-figure--video">
          <VideoEmbed url={v.url} title={v.caption ?? ""} />
          {v.caption ? (
            <figcaption>{v.caption}</figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function ProjectArticle({ blocks }: { blocks: PortableTextBlock[] }) {
  return (
    <div className="project-article">
      <PortableText value={blocks} components={components} />
    </div>
  );
}
