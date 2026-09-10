import { defineType, defineField } from "sanity";

/**
 * Encrypted copy of the /for/books browser data. One document per
 * vault. Everything in `ciphertext` was encrypted in the browser with
 * a key derived from a passphrase Sanity never sees — the server (and
 * anyone reading this dataset) only ever holds bytes. Written by
 * /api/books-sync, never by hand.
 */
export const booksSync = defineType({
  name: "booksSync",
  title: "Books sync (encrypted)",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "vault", title: "Vault", type: "string", validation: (r) => r.required() }),
    defineField({ name: "salt", title: "KDF salt (base64)", type: "string" }),
    defineField({ name: "iv", title: "AES-GCM nonce (base64)", type: "string" }),
    defineField({ name: "ciphertext", title: "Ciphertext (base64, gzip inside)", type: "text" }),
    defineField({ name: "authHash", title: "SHA-256 of the write token", type: "string" }),
    defineField({ name: "rev", title: "Revision", type: "number" }),
    defineField({ name: "bytes", title: "Ciphertext size", type: "number" }),
    defineField({ name: "updatedAt", title: "Updated at", type: "datetime" }),
    defineField({ name: "device", title: "Last writer", type: "string" }),
  ],
  preview: {
    select: { title: "vault", subtitle: "updatedAt", rev: "rev" },
    prepare({ title, subtitle, rev }) {
      return { title: `Vault ${title}`, subtitle: `rev ${rev ?? 0} · ${subtitle ? new Date(subtitle).toLocaleString() : "never"}` };
    },
  },
});
