import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  signableClients,
  isSignableClientSlug,
} from "@/content/clients/signable";

export const runtime = "nodejs";

/**
 * Fired when a client checks off an item on their pending list. Sends a
 * heads-up email to Guil so he can verify the task is actually done and
 * remove the item from the page data. Best-effort: the check-off UI state
 * lives in the client's browser, so a failed email never blocks them.
 */
export async function POST(req: Request) {
  let body: { clientSlug?: string; text?: string; due?: string | null };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const clientSlug = String(body.clientSlug ?? "").trim();
  const text = String(body.text ?? "").trim();
  const due = body.due ? String(body.due).trim() : "";

  if (!isSignableClientSlug(clientSlug)) {
    return NextResponse.json({ error: "Unknown client." }, { status: 400 });
  }
  if (!text || text.length > 300) {
    return NextResponse.json({ error: "Invalid item." }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM ?? "signatures@guil.is";
  const notifyAddress = process.env.SIGNATURE_NOTIFY_EMAIL ?? "guil@guil.is";

  if (resendKey) {
    try {
      const clientName = signableClients[clientSlug].clientName;
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: `guil.is <${fromAddress}>`,
        to: [notifyAddress],
        subject: `${clientName}: pending item checked off`,
        text: [
          `The client checked off a pending item on /for/${clientSlug}:`,
          "",
          `  ${text}`,
          due ? `  Due: ${due}` : "",
          "",
          "Verify it's actually done, then remove the item from the page data.",
        ]
          .filter(Boolean)
          .join("\n"),
      });
    } catch (err) {
      console.error("[pending-action] email send failed", err);
    }
  } else {
    console.warn(
      "[pending-action] RESEND_API_KEY not set — check-off not emailed.",
    );
  }

  return NextResponse.json({ ok: true });
}
