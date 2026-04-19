import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSanityWriteClient } from "@/lib/sanity-write";
import { sanityClient } from "@/lib/sanity";
import { getProposal } from "@/content/proposals";

export const runtime = "nodejs";

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Payload = { slug?: string };

/**
 * Records a single proposal-page visit. Called by <VisitTracker />
 * once per browser-tab session after the password gate unlocks the
 * content. On the first visit for a given slug, fires a heads-up
 * email so Guil gets a live 'Nick just opened Odyssey' ping.
 *
 * Always returns 200-ish so a failed write doesn't surface to the
 * visitor — the tracker fires in the background from the client.
 */
export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (!slug || !/^[a-z0-9-]{1,100}$/.test(slug)) {
    return NextResponse.json({ ok: false, error: "Invalid slug" }, { status: 400 });
  }

  const proposal = getProposal(slug);
  const clientName = proposal?.clientName ?? undefined;

  const visitedAt = new Date().toISOString();
  const ipAddress = getIp(req);
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  // Count prior visits BEFORE writing so we can decide whether this
  // is the first one and thus whether to email.
  let existingCount = 0;
  try {
    existingCount = await sanityClient.fetch<number>(
      `count(*[_type == "proposalVisit" && slug == $slug])`,
      { slug },
    );
  } catch (err) {
    console.error("[track-visit] prior-visit count failed", err);
  }

  try {
    await getSanityWriteClient().create({
      _type: "proposalVisit",
      slug,
      clientName,
      visitedAt,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error("[track-visit] Sanity write failed", err);
    // Return 200 so the client doesn't retry aggressively; this is
    // observability, not a required side-effect of loading the page.
    return NextResponse.json({ ok: false });
  }

  if (existingCount === 0) {
    await sendFirstVisitEmail({
      slug,
      clientName,
      visitedAt,
      ipAddress,
      userAgent,
    });
  }

  return NextResponse.json({ ok: true, firstVisit: existingCount === 0 });
}

async function sendFirstVisitEmail(params: {
  slug: string;
  clientName?: string;
  visitedAt: string;
  ipAddress: string;
  userAgent: string;
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.warn(
      "[track-visit] RESEND_API_KEY not set — first-visit email skipped.",
    );
    return;
  }
  const fromAddress = process.env.RESEND_FROM ?? "signatures@guil.is";
  const notifyAddress = process.env.SIGNATURE_NOTIFY_EMAIL ?? "guil@guil.is";

  const { slug, clientName, visitedAt, ipAddress, userAgent } = params;
  const label = clientName
    ? `${clientName} just opened their proposal`
    : `/for/${slug} just got its first visit`;

  const url = `https://guil.is/for/${slug}`;
  const when = new Date(visitedAt).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  });

  const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0a0a0a;line-height:1.6;max-width:520px;margin:0 auto;padding:24px;">
  <p style="margin:0 0 12px;font-size:15px;">${escapeHtml(label)}.</p>
  <p style="margin:0 0 16px;"><a href="${url}" style="color:#0a0a0a;">${url}</a></p>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr><td style="color:#7e7e7e;padding:4px 12px 4px 0;width:35%;">When</td><td style="padding:4px 0;">${escapeHtml(when)} UTC</td></tr>
    <tr><td style="color:#7e7e7e;padding:4px 12px 4px 0;">IP</td><td style="padding:4px 0;">${escapeHtml(ipAddress)}</td></tr>
    <tr><td style="color:#7e7e7e;padding:4px 12px 4px 0;vertical-align:top;">Device</td><td style="padding:4px 0;font-size:12px;color:#333;">${escapeHtml(userAgent)}</td></tr>
  </table>
</div>`;

  const text = [
    `${label}.`,
    url,
    "",
    `When: ${when} UTC`,
    `IP: ${ipAddress}`,
    `Device: ${userAgent}`,
  ].join("\n");

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: `Guil Site <${fromAddress}>`,
      to: [notifyAddress],
      subject: `🔎 ${label}`,
      html,
      text,
    });
  } catch (err) {
    console.error("[track-visit] first-visit email send failed", err);
  }
}
