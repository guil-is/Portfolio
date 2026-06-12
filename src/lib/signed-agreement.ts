import { sanityClient } from "./sanity";

export type SignedAgreement = {
  _id: string;
  clientSlug: string;
  /** Which document on the client this signature applies to. Defaults
   * to "sow" when missing for backwards compat with existing records. */
  documentKey?: string;
  signerName: string;
  signerEmail: string;
  signedAt: string;
  ipAddress?: string;
  userAgent?: string;
  documentVersion: string;
  documentHash: string;
  acknowledgments?: string[];
  /** Legal entity the signer is signing on behalf of, when the page
   * collects it (e.g. /for/tedxberlin). Optional for backwards compat. */
  clientEntity?: string;
};

/**
 * Look up the most recent signed agreement for a given client + doc version.
 * Returns null if none exists or Sanity is unreachable.
 */
export async function getLatestSignature(
  clientSlug: string,
  documentVersion: string,
): Promise<SignedAgreement | null> {
  try {
    const result = await sanityClient.fetch<SignedAgreement | null>(
      `*[_type == "signedAgreement" && clientSlug == $clientSlug && documentVersion == $documentVersion] | order(signedAt desc)[0]`,
      { clientSlug, documentVersion },
    );
    return result ?? null;
  } catch {
    return null;
  }
}
