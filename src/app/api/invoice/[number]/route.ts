import { NextResponse } from "next/server";
import { getIssuedInvoice } from "@/content/invoices/issued";
import { paymentProfiles } from "@/content/invoices/config";
import { renderInvoicePdf } from "@/lib/invoice-pdf";

export const runtime = "nodejs";

/**
 * Serves issued invoices as PDFs, re-rendered on demand from the specs in
 * src/content/invoices/issued.ts. Only whitelisted numbers resolve, so the
 * URL space is not enumerable beyond what client pages link to.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  const { number } = await params;
  const spec = getIssuedInvoice(number);
  if (!spec) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const profiles = spec.paymentProfiles
    .map((key) => paymentProfiles[key])
    .filter((p) => p !== undefined);

  let pdf: Buffer;
  try {
    pdf = await renderInvoicePdf(spec, profiles);
  } catch (err) {
    console.error("[invoice] PDF render failed", err);
    return NextResponse.json(
      { error: "Could not render PDF." },
      { status: 500 },
    );
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${spec.number}.pdf"`,
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    },
  });
}
