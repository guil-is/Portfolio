import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSanityWriteClient } from "@/lib/sanity-write";
import { justice } from "@/content/clients/justice";
import { hashSow } from "@/lib/sow-hash";
import { getLatestSignature, type SignedAgreement } from "@/lib/signed-agreement";
import { renderAgreementPdf } from "@/lib/agreement-pdf";

export const runtime = "nodejs";

// Map of client slug → source of truth for that client's SOW.
// Add new clients here as they come online.
const clients = { justice } as const;
type ClientSlug = keyof typeof clients;

function isClientSlug(value: string): value is ClientSlug {
  return Object.prototype.hasOwnProperty.call(clients, value);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function formatConfirmationEmail(params: {
  clientName: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  documentVersion: string;
  documentHash: string;
  acknowledgments: string[];
  pdfAttached: boolean;
}): { subject: string; html: string; text: string } {
  const {
    clientName,
    signerName,
    signerEmail,
    signedAt,
    ipAddress,
    userAgent,
    documentVersion,
    documentHash,
    acknowledgments,
    pdfAttached,
  } = params;

  const subject = `Signed: ${clientName} × Guil Maueler — Statement of Work`;

  const bulletList = acknowledgments.map((a) => `  • ${a}`).join("\n");

  const text = [
    `This confirms that ${signerName} (${signerEmail}) has electronically signed the Statement of Work between Guilherme Maueler and ${clientName}.`,
    "",
    `Signed at: ${signedAt}`,
    `Document version: ${documentVersion}`,
    `Document hash (SHA-256): ${documentHash}`,
    `IP address at signing: ${ipAddress}`,
    `User agent: ${userAgent}`,
    "",
    "Acknowledgments confirmed:",
    bulletList,
    "",
    pdfAttached
      ? "A signed PDF copy of the full agreement is attached to this email."
      : "A full copy of the agreement is retained at https://guil.is/for/justice.",
  ].join("\n");

  const htmlBullets = acknowledgments
    .map((a) => `<li style="margin:4px 0;">${escapeHtml(a)}</li>`)
    .join("");

  const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0a0a0a;line-height:1.6;max-width:560px;margin:0 auto;padding:24px;">
  <p style="margin:0 0 16px;">This confirms that <strong>${escapeHtml(signerName)}</strong> (${escapeHtml(signerEmail)}) has electronically signed the Statement of Work between Guilherme Maueler and <strong>${escapeHtml(clientName)}</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
    <tr><td style="color:#7e7e7e;padding:6px 12px 6px 0;width:40%;">Signed at</td><td style="padding:6px 0;">${escapeHtml(signedAt)}</td></tr>
    <tr><td style="color:#7e7e7e;padding:6px 12px 6px 0;">Document version</td><td style="padding:6px 0;">${escapeHtml(documentVersion)}</td></tr>
    <tr><td style="color:#7e7e7e;padding:6px 12px 6px 0;">Document hash</td><td style="padding:6px 0;font-family:ui-monospace,monospace;font-size:12px;word-break:break-all;">${escapeHtml(documentHash)}</td></tr>
    <tr><td style="color:#7e7e7e;padding:6px 12px 6px 0;">IP address</td><td style="padding:6px 0;">${escapeHtml(ipAddress)}</td></tr>
    <tr><td style="color:#7e7e7e;padding:6px 12px 6px 0;vertical-align:top;">User agent</td><td style="padding:6px 0;font-size:12px;color:#333;">${escapeHtml(userAgent)}</td></tr>
  </table>
  <p style="margin:16px 0 8px;font-weight:600;">Acknowledgments confirmed:</p>
  <ul style="padding-left:20px;margin:0 0 16px;">${htmlBullets}</ul>
  <p style="margin:24px 0 0;font-size:13px;color:#7e7e7e;">${pdfAttached ? "A signed PDF copy of the full agreement is attached to this email." : `A full copy of the agreement is retained at <a href="https://guil.is/for/justice" style="color:#0a0a0a;">guil.is/for/justice</a>.`}</p>
</div>`;

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Payload = {
  clientSlug: string;
  name: string;
  email: string;
  acknowledgments: string[];
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const clientSlug = String(body.clientSlug ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const ackChecked = Array.isArray(body.acknowledgments)
    ? body.acknowledgments.map((s) => String(s).trim())
    : [];

  if (!clientSlug || !isClientSlug(clientSlug)) {
    return NextResponse.json({ error: "Unknown client." }, { status: 400 });
  }
  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  }
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const client = clients[clientSlug];
  const requiredAcks = client.sow.acknowledgments;
  const allChecked = requiredAcks.every((a) => ackChecked.includes(a));
  if (!allChecked || ackChecked.length !== requiredAcks.length) {
    return NextResponse.json(
      { error: "Please confirm all acknowledgments." },
      { status: 400 },
    );
  }

  const existing = await getLatestSignature(clientSlug, client.sow.version);
  if (existing) {
    return NextResponse.json(
      { error: "This agreement version has already been signed.", existing },
      { status: 409 },
    );
  }

  const documentHash = hashSow(client);
  const signedAt = new Date().toISOString();
  const ipAddress = getIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  let record;
  try {
    record = await getSanityWriteClient().create({
      _type: "signedAgreement",
      clientSlug,
      signerName: name,
      signerEmail: email,
      signedAt,
      ipAddress,
      userAgent,
      documentVersion: client.sow.version,
      documentHash,
      acknowledgments: requiredAcks,
    });
  } catch (err) {
    console.error("[sign-agreement] Sanity write failed", err);
    return NextResponse.json(
      { error: "Could not save signature. Please try again." },
      { status: 500 },
    );
  }

  const signature: SignedAgreement = {
    _id: record._id,
    clientSlug,
    signerName: name,
    signerEmail: email,
    signedAt,
    ipAddress,
    userAgent,
    documentVersion: client.sow.version,
    documentHash,
    acknowledgments: requiredAcks,
  };

  // Render a PDF of the signed agreement — best-effort. If it fails we
  // still return success since the Sanity record is the legal artifact.
  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await renderAgreementPdf(client, signature);
  } catch (err) {
    console.error("[sign-agreement] PDF render failed", err);
  }

  // Email — best-effort. Sanity record is the primary artifact; we
  // don't want to fail the whole request if email is down or the API
  // key isn't configured yet.
  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM ?? "signatures@guil.is";
  const notifyAddress = process.env.SIGNATURE_NOTIFY_EMAIL ?? "guil@guil.is";
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const mail = formatConfirmationEmail({
        clientName: client.clientName,
        signerName: name,
        signerEmail: email,
        signedAt,
        ipAddress,
        userAgent,
        documentVersion: client.sow.version,
        documentHash,
        acknowledgments: requiredAcks,
        pdfAttached: !!pdfBuffer,
      });
      await resend.emails.send({
        from: `Guil Maueler <${fromAddress}>`,
        to: [email, notifyAddress],
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        replyTo: notifyAddress,
        attachments: pdfBuffer
          ? [
              {
                filename: `${clientSlug}-sow-${client.sow.version}-signed.pdf`,
                content: pdfBuffer,
              },
            ]
          : undefined,
      });
    } catch (err) {
      console.error("[sign-agreement] email send failed", err);
    }
  } else {
    console.warn(
      "[sign-agreement] RESEND_API_KEY not set — signature recorded without email notification.",
    );
  }

  return NextResponse.json({ ok: true, signature });
}
