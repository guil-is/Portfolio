/**
 * Minimal Google Drive client for the invoice archive. No SDK: three REST
 * calls (token refresh, list, multipart upload) over global `fetch`.
 *
 * Auth is an OAuth refresh token for Guil's own Google account, minted
 * once with `npm run gdrive:auth` (setup in docs/making-an-invoice.md).
 *
 * Env:
 *   GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN  required
 *   GDRIVE_INVOICES_FOLDER_ID  optional, overrides config.ts
 */

const FOLDER_MIME = "application/vnd.google-apps.folder";
const DRIVE = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";

export type DriveConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  /** The "Invoices" folder that holds the "Invoices <year>" subfolders. */
  rootFolderId: string;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
};

/** Null when the three credential vars aren't all set. */
export function driveConfigFromEnv(
  defaultRootFolderId: string,
): DriveConfig | null {
  const {
    GDRIVE_CLIENT_ID: clientId,
    GDRIVE_CLIENT_SECRET: clientSecret,
    GDRIVE_REFRESH_TOKEN: refreshToken,
    GDRIVE_INVOICES_FOLDER_ID: rootFolderId,
  } = process.env;
  if (!clientId || !clientSecret || !refreshToken) return null;
  return {
    clientId,
    clientSecret,
    refreshToken,
    rootFolderId: rootFolderId || defaultRootFolderId,
  };
}

export class DriveClient {
  private accessToken: string | null = null;

  constructor(private readonly cfg: DriveConfig) {}

  private async token(): Promise<string> {
    if (this.accessToken) return this.accessToken;
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.cfg.clientId,
        client_secret: this.cfg.clientSecret,
        refresh_token: this.cfg.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) {
      throw new Error(
        `Google token refresh failed (${res.status}): ${await res.text()}` +
          `\nIf this says invalid_grant, the refresh token was revoked or` +
          ` expired — run \`npm run gdrive:auth\` again.`,
      );
    }
    const json = (await res.json()) as { access_token: string };
    this.accessToken = json.access_token;
    return this.accessToken;
  }

  private async api<T>(url: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        authorization: `Bearer ${await this.token()}`,
      },
    });
    if (!res.ok) {
      throw new Error(
        `Drive ${init.method ?? "GET"} ${url} failed (${res.status}): ${await res.text()}`,
      );
    }
    return (await res.json()) as T;
  }

  /** Signed-in account, to confirm the token belongs to the right user. */
  async whoAmI(): Promise<string> {
    const about = await this.api<{ user: { emailAddress: string } }>(
      `${DRIVE}/about?fields=user(emailAddress)`,
    );
    return about.user.emailAddress;
  }

  /** Every non-trashed child of a folder (paginates). */
  async listChildren(folderId: string): Promise<DriveFile[]> {
    const files: DriveFile[] = [];
    let pageToken: string | undefined;
    do {
      const params = new URLSearchParams({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "nextPageToken, files(id, name, mimeType, webViewLink)",
        pageSize: "200",
      });
      if (pageToken) params.set("pageToken", pageToken);
      const page = await this.api<{
        nextPageToken?: string;
        files: DriveFile[];
      }>(`${DRIVE}/files?${params}`);
      files.push(...page.files);
      pageToken = page.nextPageToken;
    } while (pageToken);
    return files;
  }

  /** Id of the named subfolder, created if missing. */
  async ensureFolder(parentId: string, name: string): Promise<string> {
    const existing = (await this.listChildren(parentId)).find(
      (f) => f.mimeType === FOLDER_MIME && f.name === name,
    );
    if (existing) return existing.id;
    const created = await this.api<{ id: string }>(
      `${DRIVE}/files?fields=id`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
      },
    );
    return created.id;
  }

  /** Multipart upload of a small binary file into a folder. */
  async uploadFile(
    parentId: string,
    name: string,
    mimeType: string,
    body: Uint8Array,
  ): Promise<DriveFile> {
    const boundary = `inv-${Date.now().toString(36)}`;
    const meta = JSON.stringify({ name, parents: [parentId] });
    const head =
      `--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n` +
      `${meta}\r\n--${boundary}\r\ncontent-type: ${mimeType}\r\n\r\n`;
    const tail = `\r\n--${boundary}--`;
    const payload = new Uint8Array(
      Buffer.concat([Buffer.from(head), Buffer.from(body), Buffer.from(tail)]),
    );
    return this.api<DriveFile>(
      `${UPLOAD}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink`,
      {
        method: "POST",
        headers: { "content-type": `multipart/related; boundary=${boundary}` },
        body: payload,
      },
    );
  }
}

/** Canonical archive filename: "INV-26020 Sustainable Public Affairs.pdf". */
export function archiveFileName(number: string, clientName: string): string {
  const safe = clientName.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
  return `${number} ${safe}.pdf`;
}

const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Whether an invoice is already in the folder. Matches on the number
 * only, ignoring dashes and case, so the hand-named files from before
 * this script ("INV26018 Logos.pdf", "INV-26013.pdf") count too. A
 * digit right after the number is rejected so INV-2601 can't claim
 * INV-26010.
 */
export function findArchived(
  files: DriveFile[],
  number: string,
): DriveFile | undefined {
  const key = squash(number);
  return files.find((f) => {
    const name = squash(f.name);
    return name.startsWith(key) && !/^\d/.test(name.slice(key.length));
  });
}

export type ArchiveResult = {
  status: "uploaded" | "exists";
  file: DriveFile;
  folderName: string;
};

/**
 * Put an invoice PDF into "<root>/Invoices <year>/", skipping when a
 * file for that number is already there. Idempotent, so it's safe to run
 * from the CLI right after rendering AND from CI on every push.
 */
export async function archiveInvoicePdf(
  drive: DriveClient,
  rootFolderId: string,
  inv: { number: string; clientName: string; issuedAt: string; pdf: Uint8Array },
): Promise<ArchiveResult> {
  const folderName = `Invoices ${inv.issuedAt.slice(0, 4)}`;
  const folderId = await drive.ensureFolder(rootFolderId, folderName);
  const existing = findArchived(await drive.listChildren(folderId), inv.number);
  if (existing) return { status: "exists", file: existing, folderName };
  const file = await drive.uploadFile(
    folderId,
    archiveFileName(inv.number, inv.clientName),
    "application/pdf",
    inv.pdf,
  );
  return { status: "uploaded", file, folderName };
}
