import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getProposal } from "@/content/proposals";

export const runtime = "nodejs";

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Fired when a client hits "Accept this proposal" on /for/[slug]. This is
 * the acceptance *signal*, not a contract — the agreement gets signed on
 * the client page that follows (docs/client-lifecycle.md § "Accepted →
 * agreement"). Sends a heads-up email so Guil can confirm in chat and
 * move the client to stage "accepted". Best-effort like pending-action:
 * the client sees success even if email delivery fails, so a mail outage
 * never turns their yes into an error screen.
 */
export async function POST(req: Request) {
  let body: { slug?: string; name?: string; note?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();
  const note = String(body.note ?? "").trim();

  const proposal = getProposal(slug);
  if (!proposal) {
    return NextResponse.json({ error: "Unknown proposal." }, { status: 400 });
  }
  if (!name || name.length < 2 || name.length > 100) {
    return NextResponse.json(
      { error: "Please enter your name." },
      { status: 400 },
    );
  }
  if (note.length > 1000) {
    return NextResponse.json({ error: "Note is too long." }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM ?? "signatures@guil.is";
  const notifyAddress = process.env.SIGNATURE_NOTIFY_EMAIL ?? "guil@guil.is";

  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: `guil.is <${fromAddress}>`,
        to: [notifyAddress],
        subject: `🎉 ${proposal.clientName}: proposal accepted by ${name}`,
        text: [
          `${name} accepted the proposal at https://guil.is/for/${slug}.`,
          note ? `\nNote from them:\n  ${note}` : "",
          "",
          `Accepted at: ${new Date().toISOString()}`,
          `IP: ${getIp(req)}`,
          `Device: ${req.headers.get("user-agent") ?? "unknown"}`,
          "",
          "Next, per docs/client-lifecycle.md: confirm with them in chat,",
          `set the registry stage to "accepted", check the agreement intake`,
          "gate, and start the agreement page.",
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } catch (err) {
      console.error("[accept-proposal] email send failed", err);
    }
  } else {
    console.warn(
      "[accept-proposal] RESEND_API_KEY not set — acceptance not emailed.",
    );
  }

  return NextResponse.json({ ok: true });
}
