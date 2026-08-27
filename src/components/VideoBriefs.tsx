"use client";

import { AgreementSignature } from "@/components/AgreementSignature";
import { DefinitionList } from "@/components/DefinitionList";
import type { SignedAgreement } from "@/lib/signed-agreement";
import type { HuitVideo } from "@/content/clients/huit";
import type { SowSection } from "@/content/clients/types";

/**
 * Per-video brief cards for /for/huit.
 *
 * Each video commissioned under the framework gets its own short brief and
 * its own signature, keyed by the video's `key` (the signature API's
 * `documentKey`). Noa confirms a brief in one click without re-reading the
 * agreement, and the record is hashed and timestamped rather than living in
 * a chat message that can be edited later.
 *
 * Deliberately generic over the video list so this survives the eventual
 * fold of /for/huit into the shared ClientPage.
 */
export function VideoBriefs({
  videos,
  signatures,
}: {
  videos: HuitVideo[];
  /** Latest signature per video key, or null when unconfirmed. */
  signatures: Record<string, SignedAgreement | null>;
}) {
  if (videos.length === 0) return null;

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
          Videos
        </h2>
        <p className="max-w-[640px] text-[0.95rem] leading-[1.7rem] text-muted">
          Each video under the agreement has a short brief. Confirming one
          takes a click, and the terms of the signed Framework Agreement apply
          without needing to read it again.
        </p>
      </div>

      {videos.map((video) => (
        <BriefCard
          key={video.key}
          video={video}
          signature={signatures[video.key] ?? null}
        />
      ))}
    </section>
  );
}

function BriefCard({
  video,
  signature,
}: {
  video: HuitVideo;
  signature: SignedAgreement | null;
}) {
  const { brief } = video;

  return (
    <article className="brief-card flex flex-col gap-6 rounded-[14px] border border-rule-soft p-6 md:p-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-[1.25rem] font-bold leading-tight text-ink">
            {video.title}
          </h3>
          <StatusPill status={video.status} confirmed={Boolean(signature)} />
        </div>
        <p className="text-[0.9rem] leading-[1.6rem] text-muted">
          {brief.preamble}
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {brief.sections.map((section) => (
          <BriefSection key={section.heading} section={section} />
        ))}
      </div>

      {video.deliveryUrl ? (
        <p className="text-[0.9rem] leading-[1.6rem] text-muted">
          Final exports:{" "}
          <a
            href={video.deliveryUrl}
            target="_blank"
            rel="noreferrer"
            className="text-ink underline underline-offset-2"
          >
            Google Drive
          </a>
        </p>
      ) : null}

      <div className="no-print border-t border-rule-soft pt-6">
        <AgreementSignature
          clientSlug="huit"
          documentKey={video.key}
          acknowledgments={brief.acknowledgments}
          documentVersion={brief.version}
          initialSignature={signature}
          formTitle="Confirm this brief"
          submitLabel="Confirm brief"
        />
      </div>
    </article>
  );
}

function StatusPill({
  status,
  confirmed,
}: {
  status: HuitVideo["status"];
  confirmed: boolean;
}) {
  const label = confirmed && status === "briefed" ? "confirmed" : status;
  return (
    <span className="font-caption rounded-full border border-rule-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[1.2px] text-muted">
      {label}
    </span>
  );
}

function BriefSection({ section }: { section: SowSection }) {
  return (
    <section className="flex flex-col gap-3">
      <h4 className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
        {section.heading}
      </h4>
      <div className="flex flex-col gap-3">
        {section.blocks.map((b, i) => {
          if (b.type === "p") {
            return (
              <p
                key={i}
                className="text-[0.95rem] leading-[1.7rem] text-ink"
              >
                {b.text}
              </p>
            );
          }
          if (b.type === "ul") {
            return (
              <ul key={i} className="flex flex-col gap-2 pl-5">
                {b.items.map((it, j) => (
                  <li
                    key={j}
                    className="list-disc text-[0.95rem] leading-[1.7rem] text-ink marker:text-muted"
                  >
                    {it}
                  </li>
                ))}
              </ul>
            );
          }
          return <DefinitionList key={i} rows={b.rows} />;
        })}
      </div>
    </section>
  );
}
