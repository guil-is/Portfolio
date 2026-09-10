/**
 * Browser-side crypto for the encrypted sync. Web Crypto only, nothing
 * imported. Passphrase → PBKDF2 → two keys: an AES-GCM key for the
 * data and a separate bearer token that proves to the API you know the
 * passphrase without revealing it. The payload is gzipped before it's
 * encrypted, so a year of bank rows stays small.
 */

const PBKDF2_ITERATIONS = 310_000;
const KEY_INFO = { data: "guil-books:data:v1", auth: "guil-books:auth:v1" };

export type DerivedKeys = { aesKey: CryptoKey; authToken: string };

const te = new TextEncoder();
const td = new TextDecoder();

export function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}

export function toBase64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export function fromBase64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function toUrlSafe(s: string): string {
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Both keys from one passphrase and the vault's salt. Slow on purpose. */
export async function deriveKeys(passphrase: string, salt: Uint8Array): Promise<DerivedKeys> {
  const base = await crypto.subtle.importKey("raw", te.encode(passphrase.normalize("NFKC")), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS }, base, 512);
  const master = new Uint8Array(bits);
  const hkdfKey = await crypto.subtle.importKey("raw", master as BufferSource, "HKDF", false, ["deriveBits", "deriveKey"]);
  const aesKey = await crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: te.encode(KEY_INFO.data) },
    hkdfKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
  const authBits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: te.encode(KEY_INFO.auth) }, hkdfKey, 256);
  return { aesKey, authToken: toUrlSafe(toBase64(new Uint8Array(authBits))) };
}

export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
  return crypto.subtle.exportKey("jwk", key);
}

export async function importKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export type Sealed = { iv: string; ciphertext: string };

export async function seal(aesKey: CryptoKey, json: string): Promise<Sealed> {
  const iv = randomBytes(12);
  const packed = await gzip(te.encode(json));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, aesKey, packed as BufferSource);
  return { iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ct)) };
}

/** Throws on a wrong key or tampered data (GCM authenticates). */
export async function open(aesKey: CryptoKey, sealed: Sealed): Promise<string> {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(sealed.iv) as BufferSource }, aesKey, fromBase64(sealed.ciphertext) as BufferSource);
  return td.decode(await gunzip(new Uint8Array(pt)));
}

/** Stable fingerprint of a string, for "did anything change since the last push". */
export async function fingerprint(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", te.encode(s));
  return toBase64(new Uint8Array(d)).slice(0, 22);
}
