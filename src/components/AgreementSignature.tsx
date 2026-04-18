"use client";

import { useState, type FormEvent } from "react";
import { Check, Download, ShieldCheck } from "lucide-react";
import type { SignedAgreement } from "@/lib/signed-agreement";

type Props = {
  clientSlug: string;
  acknowledgments: string[];
  documentVersion: string;
  initialSignature: SignedAgreement | null;
};

export function AgreementSignature({
  clientSlug,
  acknowledgments,
  documentVersion,
  initialSignature,
}: Props) {
  const [signature, setSignature] = useState<SignedAgreement | null>(
    initialSignature,
  );

  if (signature) {
    return <SignedCertificate signature={signature} />;
  }

  return (
    <SignatureForm
      clientSlug={clientSlug}
      acknowledgments={acknowledgments}
      documentVersion={documentVersion}
      onSigned={setSignature}
    />
  );
}

// ---------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------
function SignatureForm({
  clientSlug,
  acknowledgments,
  onSigned,
}: {
  clientSlug: string;
  acknowledgments: string[];
  documentVersion: string;
  onSigned: (s: SignedAgreement) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checked, setChecked] = useState<boolean[]>(
    acknowledgments.map(() => false),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const allChecked = checked.every(Boolean);
  const canSubmit = !!name.trim() && !!email.trim() && allChecked && !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/sign-agreement", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientSlug,
          name: name.trim(),
          email: email.trim(),
          acknowledgments,
        }),
      });
      const data = (await res.json()) as
        | { ok: true; signature: SignedAgreement }
        | { error: string; existing?: SignedAgreement };
      if (!res.ok) {
        if ("existing" in data && data.existing) {
          onSigned(data.existing);
          return;
        }
        setError("error" in data ? data.error : "Something went wrong.");
        return;
      }
      if ("signature" in data) onSigned(data.signature);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggle(i: number) {
    setChecked((prev) => prev.map((v, j) => (i === j ? !v : v)));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <p className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted">
          Sign the agreement
        </p>
        <h3 className="mt-3 font-display text-[1.5rem] font-bold leading-tight text-ink md:text-[1.875rem]">
          Confirm and sign electronically
        </h3>
        <p className="mt-3 max-w-[560px] text-[0.95rem] leading-[1.65rem] text-muted">
          Your name, email, and checked boxes together form your legal signature. A
          timestamped copy of this confirmation will be emailed to you immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field
          label="Full name"
          id="sig-name"
          value={name}
          onChange={setName}
          autoComplete="name"
          placeholder="Justice Conder"
        />
        <Field
          label="Email"
          id="sig-email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <ul className="flex flex-col gap-3 border-t border-rule-soft pt-6">
        {acknowledgments.map((ack, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] leading-[1.55rem] text-ink">
              <span
                className={[
                  "mt-[2px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                  checked[i]
                    ? "border-ink bg-ink text-bg"
                    : "border-rule bg-transparent text-transparent",
                ].join(" ")}
                aria-hidden
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="sr-only"
              />
              <span>{ack}</span>
            </label>
          </li>
        ))}
      </ul>

      {error ? (
        <p className="text-[0.9rem] text-[#d14343]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className="cta-pill group inline-flex h-14 items-center gap-4 self-start pr-6 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex h-14 w-14 items-center justify-center text-bg">
          <Check className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <span className="font-caption text-[13px] font-bold uppercase tracking-[1px]">
          {submitting ? "Signing…" : "Sign agreement"}
        </span>
      </button>
    </form>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-caption text-[11px] font-medium uppercase tracking-[1.5px] text-muted"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full border-b border-rule bg-transparent pb-2 text-[1rem] leading-[1.6] text-ink transition-colors placeholder:text-faint focus:border-ink focus:outline-none"
      />
    </div>
  );
}

// ---------------------------------------------------------------------
// Signed state — certificate card
// ---------------------------------------------------------------------
function SignedCertificate({ signature }: { signature: SignedAgreement }) {
  const signedAt = new Date(signature.signedAt);
  const formattedDate = signedAt.toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="flex flex-col gap-6 rounded-[16px] border border-rule bg-card/40 p-7 md:p-9">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-ink" strokeWidth={1.75} />
        <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-ink">
          Agreement signed
        </p>
      </div>

      <p className="max-w-[560px] text-[0.95rem] leading-[1.65rem] text-ink">
        This agreement has been electronically signed and recorded. A signed
        PDF copy was emailed to both parties at the time of signing.
      </p>

      <a
        href={`/api/sign-agreement/pdf?id=${encodeURIComponent(signature._id)}`}
        className="inline-flex items-center gap-2 self-start border-b border-ink pb-[2px] font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-ink transition-opacity hover:opacity-70"
      >
        <Download className="h-3.5 w-3.5" strokeWidth={2} />
        Download signed PDF
      </a>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-rule-soft pt-5 text-[0.9rem] md:gap-x-8">
        <CertRow label="Signed by" value={signature.signerName} />
        <CertRow label="Email" value={signature.signerEmail} />
        <CertRow label="Signed at" value={formattedDate} />
        <CertRow label="Document" value={`Version ${signature.documentVersion}`} />
        <CertRow
          label="Hash"
          value={signature.documentHash}
          mono
        />
        {signature.ipAddress ? (
          <CertRow label="IP address" value={signature.ipAddress} />
        ) : null}
      </dl>

      {signature.acknowledgments && signature.acknowledgments.length > 0 ? (
        <div className="border-t border-rule-soft pt-5">
          <p className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
            Confirmed acknowledgments
          </p>
          <ul className="mt-3 flex flex-col gap-2 pl-5">
            {signature.acknowledgments.map((a, i) => (
              <li
                key={i}
                className="list-disc text-[0.9rem] leading-[1.55rem] text-ink marker:text-muted"
              >
                {a}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function CertRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <>
      <dt className="font-caption text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
        {label}
      </dt>
      <dd
        className={[
          "text-ink",
          mono
            ? "break-all font-mono text-[11px] leading-[1.5rem]"
            : "text-[0.95rem] leading-[1.55rem]",
        ].join(" ")}
      >
        {value}
      </dd>
    </>
  );
}
