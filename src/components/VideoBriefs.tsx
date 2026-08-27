"use client";

import { useState } from "react";
import { Check, Download, Feather } from "lucide-react";
import { Timeline } from "@/components/Timeline";
import type { SignedAgreement } from "@/lib/signed-agreement";
import type { SignableClientSlug } from "@/content/clients/signable";
import type { ClientVideo, SowSection } from "@/content/clients/types";

/**
 * Per-video brief cards for the ClientPage "Videos" tab.
 *
 * Each brief is its own signable document (the video's `key` is the
 * signature API's `documentKey`), but confirming one is a single click:
 * the tab only unlocks after the framework agreement is signed, so the
 * signer's name and email are reused from that signature instead of being
 * typed again. The click still produces a full hashed, timestamped record
 * with the brief's acknowledgment text — the same thing the long form
 * produces, minus the form.
 *
 * The card is two columns on desktop: the dates timeline on the left is
 * the centerpiece, with scope, fee and supply condensed on the right.
 */
export function VideoBriefs({
  slug,
  videos,
  signatures,
  sowSignature,
}: {
  slug: SignableClientSlug;
  videos: ClientVideo[];
  /** Latest signature per video key, or null when unconfirmed. */
  signatures: Record<string, SignedAgreement | null>;
  /** The framework signature — supplies the signer identity for briefs. */
  sowSignature: SignedAgreement;
}) {
  if (videos.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
      <p className="max-w-[620px] text-[0.95rem] leading-[1.7rem] text-muted">
        Each video commissioned under the agreement gets a short brief.
        Confirming one takes a click: the signed agreement covers the terms,
        and the brief pins the scope, fee and dates.
      </p>

      {videos.map((video) => (
        <BriefCard
          key={video.key}
          slug={slug}
          video={video}
          initialSignature={signatures[video.key] ?? null}
          sowSignature={sowSignature}
        />
      ))}
    </div>
  );
}

function BriefCard({
  slug,
  video,
  initialSignature,
  sowSignature,
}: {
  slug: SignableClientSlug;
  video: ClientVideo;
  initialSignature: SignedAgreement | null;
  sowSignature: SignedAgreement;
}) {
  const [signature, setSignature] = useState<SignedAgreement | null>(
    initialSignature,
  );
  const { brief } = video;

  // The timeline is the card's centerpiece; everything else condenses
  // into a summary column beside it (stacked above it on small screens).
  const datesSection = brief.sections.find((x) => x.heading === "Timeline");
  const summarySections = brief.sections.filter(
    (x) => x.heading !== "Timeline",
  );

  return (
    <article className="brief-card flex flex-col gap-8 rounded-[14px] border border-rule p-6 md:p-9">
      <header>
        <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.75rem]">
          {`"${video.title}"`}{" "}
          <span className="font-normal text-muted">brief</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.15fr_1fr] md:gap-12">
        {datesSection ? <DatesColumn section={datesSection} /> : null}
        <SummaryColumn
          sections={summarySections}
          deliveryUrl={video.deliveryUrl}
        />
      </div>

      <div className="no-print border-t border-rule-soft pt-6">
        {signature ? (
          <ConfirmedRow signature={signature} />
        ) : (
          <ConfirmBrief
            slug={slug}
            documentKey={video.key}
            brief={brief}
            sowSignature={sowSignature}
            onConfirmed={setSignature}
          />
        )}
      </div>
    </article>
  );
}

/**
 * The one-click confirmation. POSTs to the same signing API as the long
 * form, with the signer identity carried over from the framework
 * signature, so the stored record is identical in shape: name, email,
 * acknowledgment text, document version, hash, timestamp, IP.
 */
function ConfirmBrief({
  slug,
  documentKey,
  brief,
  sowSignature,
  onConfirmed,
}: {
  slug: SignableClientSlug;
  documentKey: string;
  brief: ClientVideo["brief"];
  sowSignature: SignedAgreement;
  onConfirmed: (s: SignedAgreement) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/sign-agreement", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientSlug: slug,
          documentKey,
          name: sowSignature.signerName,
          email: sowSignature.signerEmail,
          acknowledgments: brief.acknowledgments,
          ...(sowSignature.clientEntity
            ? { clientEntity: sowSignature.clientEntity }
            : {}),
        }),
      });
      const data = (await res.json()) as
        | { ok: true; signature: SignedAgreement }
        | { error: string; existing?: SignedAgreement };
      if (!res.ok) {
        if ("existing" in data && data.existing) {
          onConfirmed(data.existing);
          return;
        }
        setError("error" in data ? data.error : "Something went wrong.");
        return;
      }
      if ("signature" in data) onConfirmed(data.signature);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={confirm}
          disabled={submitting}
          className="inline-flex items-center gap-3 rounded-full bg-ink py-3 pl-4 pr-6 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          <Feather className="h-4 w-4" strokeWidth={2} aria-hidden />
          <span className="font-caption text-[12px] font-bold uppercase tracking-[1px]">
            {submitting ? "Confirming…" : "Confirm brief"}
          </span>
        </button>
        <p className="max-w-[420px] text-[0.85rem] leading-[1.5rem] text-muted">
          Confirms as {sowSignature.signerName} ({sowSignature.signerEmail}),
          under the signed agreement. You get a timestamped copy by email.
        </p>
      </div>
      {error ? <p className="text-[0.9rem] text-[#d14343]">{error}</p> : null}
    </div>
  );
}

function ConfirmedRow({ signature }: { signature: SignedAgreement }) {
  const confirmedAt = new Date(signature.signedAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-bg">
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </span>
        <p className="text-[0.95rem] leading-[1.5rem] text-ink">
          Confirmed by {signature.signerName}
          <span className="text-muted"> · {confirmedAt}</span>
        </p>
      </div>
      <a
        href={`/api/sign-agreement/pdf?id=${encodeURIComponent(signature._id)}`}
        className="inline-flex items-center gap-1.5 font-caption text-[11px] font-semibold uppercase tracking-[1px] text-muted transition-colors hover:text-ink"
      >
        <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        PDF
      </a>
    </div>
  );
}

function DatesColumn({ section }: { section: SowSection }) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
        {section.heading}
      </h3>
      <div className="flex flex-col gap-4">
        {section.blocks.map((b, i) => {
          if (b.type === "kv") {
            return (
              <Timeline
                key={i}
                entries={b.rows.map(([when, what]) => ({
                  eyebrow: when,
                  content: (
                    <span className="text-[0.95rem] leading-[1.6rem] text-ink">
                      {what}
                    </span>
                  ),
                }))}
              />
            );
          }
          if (b.type === "p") {
            return (
              <p key={i} className="text-[0.85rem] leading-[1.55rem] text-muted">
                {b.text}
              </p>
            );
          }
          return null;
        })}
      </div>
    </section>
  );
}

/**
 * Everything that isn't the timeline, condensed: each kv row becomes a
 * stacked label-over-value pair, sections separated by soft rules.
 */
function SummaryColumn({
  sections,
  deliveryUrl,
}: {
  sections: SowSection[];
  deliveryUrl?: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      {sections.map((section) => (
        <section
          key={section.heading}
          className="flex flex-col gap-4 border-b border-rule-soft pb-6 last:border-b-0 last:pb-0"
        >
          <h3 className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
            {section.heading}
          </h3>
          <div className="flex flex-col gap-3">
            {section.blocks.map((b, i) => {
              if (b.type === "kv") {
                return b.rows.map(([k, v]) => (
                  <div key={`${i}-${k}`} className="flex flex-col gap-0.5">
                    <p className="font-caption text-[10px] font-semibold uppercase tracking-[1.2px] text-faint">
                      {k}
                    </p>
                    <p className="text-[0.9rem] leading-[1.55rem] text-ink">
                      {v}
                    </p>
                  </div>
                ));
              }
              if (b.type === "p") {
                return (
                  <p
                    key={i}
                    className="text-[0.85rem] leading-[1.55rem] text-muted"
                  >
                    {b.text}
                  </p>
                );
              }
              return (
                <ul key={i} className="flex flex-col gap-1.5 pl-4">
                  {b.items.map((it, j) => (
                    <li
                      key={j}
                      className="list-disc text-[0.9rem] leading-[1.55rem] text-ink marker:text-muted"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              );
            })}
          </div>
        </section>
      ))}

      {deliveryUrl ? (
        <p className="text-[0.85rem] leading-[1.55rem] text-muted">
          Final exports:{" "}
          <a
            href={deliveryUrl}
            target="_blank"
            rel="noreferrer"
            className="text-ink underline underline-offset-2"
          >
            Google Drive
          </a>
        </p>
      ) : null}
    </div>
  );
}
