import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity";
import { justice } from "@/content/clients/justice";
import { renderAgreementPdf } from "@/lib/agreement-pdf";
import type { SignedAgreement } from "@/lib/signed-agreement";

export const runtime = "nodejs";

const clients = { justice } as const;
type ClientSlug = keyof typeof clients;

function isClientSlug(value: string): value is ClientSlug {
  return Object.prototype.hasOwnProperty.call(clients, value);
}

function resolveDoc(
  client: (typeof clients)[ClientSlug],
  documentKey: string,
) {
  if (documentKey === "sow") return client.sow;
  return client.amendments?.[documentKey] ?? null;
}

/**
 * Re-download the signed PDF for a given signature record.
 *
 * Treated as a capability URL: knowledge of the (unguessable) Sanity
 * document ID grants read access. The ID is only surfaced to the
 * password-gated client page, so this is acceptable for a single-client
 * consulting tool. Revisit if the threat model ever demands stronger
 * access control.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const signature = await sanityClient.fetch<SignedAgreement | null>(
    `*[_type == "signedAgreement" && _id == $id][0]`,
    { id },
  );

  if (!signature) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!isClientSlug(signature.clientSlug)) {
    return NextResponse.json({ error: "Unknown client." }, { status: 400 });
  }

  const client = clients[signature.clientSlug];
  const documentKey = signature.documentKey ?? "sow";
  const doc = resolveDoc(client, documentKey);
  if (!doc) {
    return NextResponse.json(
      { error: `Unknown document key: ${documentKey}` },
      { status: 400 },
    );
  }

  let pdf: Buffer;
  try {
    pdf = await renderAgreementPdf(client, doc, signature);
  } catch (err) {
    console.error("[sign-agreement/pdf] render failed", err);
    return NextResponse.json(
      { error: "Could not render PDF." },
      { status: 500 },
    );
  }

  const filename = `${signature.clientSlug}-${documentKey}-${signature.documentVersion}-signed.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
    },
  });
}
