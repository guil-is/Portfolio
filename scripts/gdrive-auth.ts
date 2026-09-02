/**
 * One-time Google Drive authorisation for the invoice archive.
 *
 *   npm run gdrive:auth
 *
 * Needs GDRIVE_CLIENT_ID + GDRIVE_CLIENT_SECRET in .env.local (a "Desktop
 * app" OAuth client from Google Cloud — steps in docs/making-an-invoice.md).
 * Opens a consent URL, catches the redirect on localhost, swaps the code
 * for a refresh token, and prints the GDRIVE_REFRESH_TOKEN line to paste
 * into .env.local and the GitHub repository secrets.
 */

import { createServer } from "node:http";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFiles } from "./lib/env";
import { DriveClient } from "./lib/gdrive";
import { driveArchive } from "../src/content/invoices/config";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadEnvFiles(repoRoot);

const PORT = 53682;
const REDIRECT = `http://127.0.0.1:${PORT}/callback`;
const SCOPE = "https://www.googleapis.com/auth/drive";

const clientId = process.env.GDRIVE_CLIENT_ID;
const clientSecret = process.env.GDRIVE_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error(
    "✗ Set GDRIVE_CLIENT_ID and GDRIVE_CLIENT_SECRET in .env.local first.\n" +
      "  Google Cloud → APIs & Services → Credentials → OAuth client ID →" +
      " Desktop app. Setup walkthrough: docs/making-an-invoice.md.",
  );
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: REDIRECT,
  response_type: "code",
  scope: SCOPE,
  access_type: "offline",
  // Force the consent screen so Google issues a refresh token even if
  // this client was authorised before.
  prompt: "consent",
}).toString();

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404).end();
    return;
  }
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (!code) {
    res.writeHead(400, { "content-type": "text/plain" });
    res.end(`No code in the callback (${error ?? "unknown error"}).`);
    console.error(`✗ Google returned: ${error ?? "no code"}`);
    server.close();
    process.exit(1);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: REDIRECT,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) {
      throw new Error(`token exchange failed (${tokenRes.status}): ${await tokenRes.text()}`);
    }
    const tokens = (await tokenRes.json()) as { refresh_token?: string };
    if (!tokens.refresh_token) {
      throw new Error(
        "Google didn't return a refresh token. Revoke the app at" +
          " myaccount.google.com/permissions and run this again.",
      );
    }

    const drive = new DriveClient({
      clientId,
      clientSecret,
      refreshToken: tokens.refresh_token,
      rootFolderId: driveArchive.rootFolderId,
    });
    const email = await drive.whoAmI();
    const rootChildren = await drive.listChildren(driveArchive.rootFolderId);

    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(
      `<p style="font:16px system-ui;padding:2rem">Authorised as <b>${email}</b>. You can close this tab.</p>`,
    );

    console.log(`\n✓ Authorised as ${email}`);
    console.log(
      `  Archive root folder has ${rootChildren.length} item(s):` +
        ` ${rootChildren.map((f) => f.name).join(", ") || "(empty)"}`,
    );
    console.log(
      `\nAdd this line to .env.local (and as a GitHub repository secret` +
        ` with the same name, alongside GDRIVE_CLIENT_ID and` +
        ` GDRIVE_CLIENT_SECRET):\n`,
    );
    console.log(`GDRIVE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain" });
    res.end(String(err));
    console.error(`✗ ${(err as Error).message}`);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Open this URL in your browser and approve access:\n");
  console.log(authUrl.toString());
  console.log(
    `\n(If Google says the app isn't verified: Advanced → Go to the app.` +
      ` It's your own OAuth client.)\nWaiting for the redirect on ${REDIRECT} …`,
  );
});
