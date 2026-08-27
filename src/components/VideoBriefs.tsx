"use client";

import { useState } from "react";
import { Check, Download, Feather } from "lucide-react";
import { DefinitionList } from "@/components/DefinitionList";
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
 * The card leads with the timeline; scope and fee stay compact above it.
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
        Confirming one takes a click — the signed agreement covers the terms,
        the brief only pins scope, fee and dates.
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

  return (
    <article className="brief-card flex flex-col gap-7 rounded-[14px] border border-rule p-6 md:p-9">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.75rem]">
          {video.title}
        </h2>
        <StatusPill status={video.status} confirmed={Boolean(signature)} />
      </header>

      <div className="flex flex-col gap-7">
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

function StatusPill({
  status,
  confirmed,
}: {
  status: ClientVideo["status"];
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
  // "Dates" is the heart of a brief — its kv rows render as the shared
  // vertical Timeline. Other kv sections stay compact definition lists.
  const asTimeline = section.heading === "Dates";
  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
        {section.heading}
      </h3>
      <div className="flex flex-col gap-4">
        {section.blocks.map((b, i) => {
          if (b.type === "p") {
            return (
              <p key={i} className="text-[0.95rem] leading-[1.7rem] text-muted">
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
          if (asTimeline) {
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
          return <DefinitionList key={i} rows={b.rows} />;
        })}
      </div>
    </section>
  );
}
