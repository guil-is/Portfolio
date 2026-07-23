/**
 * Single source of truth for every client whose agreement can be signed
 * through /api/sign-agreement.
 *
 * Add a client here the moment its /for/<slug> page renders
 * <AgreementSignature>. This one map is read by:
 *   - the signing API route (POST /api/sign-agreement)
 *   - the signed-PDF route (GET /api/sign-agreement/pdf)
 *   - AgreementSignature's `clientSlug` prop, which is typed to these keys
 *
 * Because the prop type derives from these keys, a page that passes a
 * clientSlug missing from this map fails `tsc --noEmit`. That is the guard
 * that stops a new agreement page from shipping unsigned-able: register the
 * client here or the build breaks.
 */

import { justice } from "./justice";
import { myosin } from "./myosin";
import { tedxberlin } from "./tedxberlin";
import { huit } from "./huit";
import { spa } from "./spa";
import { logos } from "./logos";
import { e2c } from "./e2c";
import type { SignableClient } from "./types";

export const signableClients = {
  justice,
  myosin,
  tedxberlin,
  huit,
  spa,
  logos,
  e2c,
} as const;

export type SignableClientSlug = keyof typeof signableClients;

export function isSignableClientSlug(value: string): value is SignableClientSlug {
  return Object.prototype.hasOwnProperty.call(signableClients, value);
}

/** Narrow accessor used by the API routes. Returns null for unknown slugs. */
export function getSignableClient(value: string): SignableClient | null {
  return isSignableClientSlug(value) ? signableClients[value] : null;
}
