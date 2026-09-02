/**
 * One-time Google Drive authorisation for the invoice archive.
 *
 *   npm run gdrive:auth                 # on a machine with a browser
 *   npm run gdrive:auth -- --url        # cloud session: print the consent URL only
 *   npm run gdrive:auth -- --code <redirect-url-or-code>   # cloud: finish
 *
 * Needs GDRIVE_CLIENT_ID + GDRIVE_CLIENT_SECRET in the env (a "Desktop
 * app" OAuth client from Google Cloud — steps in docs/making-an-invoice.md).
 *
 * Default mode opens a consent URL, catches the redirect on localhost,
 * swaps the code for a refresh token, and prints the GDRIVE_REFRESH_TOKEN
 * line to paste into .env.local and the GitHub repository secrets.
 *
 * Cloud mode (no local browser): `--url` prints the consent URL. After
 * approving, the browser is sent to http://127.0.0.1:53682/… which fails
 * to load — that's expected; the code is in that address. Paste the whole
 * address (or just the code) back via `--code` to finish.
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

/** Swap an auth code for a refresh token, sanity-check it, print it. */
async function finish(code: string): Promise<void> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: REDIRECT,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(
      `token exchange failed (${tokenRes.status}): ${await tokenRes.text()}`,
    );
  }
  const tokens = (await tokenRes.json()) as { refresh_token?: string };
  if (!tokens.refresh_token) {
    throw new Error(
      "Google didn't return a refresh token. Revoke the app at" +
        " myaccount.google.com/permissions and run this again.",
    );
  }

  const drive = new DriveClient({
    clientId: clientId!,
    clientSecret: clientSecret!,
    refreshToken: tokens.refresh_token,
    rootFolderId: driveArchive.rootFolderId,
  });
  const email = await drive.whoAmI();
  const rootChildren = await drive.listChildren(driveArchive.rootFolderId);

  console.log(`\n✓ Authorised as ${email}`);
  console.log(
    `  Archive root folder has ${rootChildren.length} item(s):` +
      ` ${rootChildren.map((f) => f.name).join(", ") || "(empty)"}`,
  );
  console.log(
    `\nAdd this as a GitHub repository secret (and to .env.local on any` +
      ` machine that runs the CLI), alongside GDRIVE_CLIENT_ID and` +
      ` GDRIVE_CLIENT_SECRET:\n`,
  );
  console.log(`GDRIVE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
}

const argv = process.argv.slice(2);
const urlOnly = argv.includes("--url");
const codeIdx = argv.indexOf("--code");
const codeArg = codeIdx >= 0 ? argv[codeIdx + 1] : undefined;

if (urlOnly) {
  console.log(
    "Open this URL in a browser, pick the account, approve access.\n" +
      "The browser will then fail to load a 127.0.0.1 page — expected." +
      " Copy that page's full address and run:\n" +
      "  npm run gdrive:auth -- --code '<paste the address here>'\n",
  );
  console.log(authUrl.toString());
  process.exit(0);
}

if (codeIdx >= 0) {
  if (!codeArg) {
    console.error("✗ --code needs the redirect address or the code itself.");
    process.exit(1);
  }
  // Accept the whole redirect URL (easier to copy) or the bare code.
  let code = codeArg.trim();
  if (code.startsWith("http")) {
    code = new URL(code).searchParams.get("code") ?? "";
    if (!code) {
      console.error("✗ That address has no ?code= in it. Copy the full URL.");
      process.exit(1);
    }
  }
  finish(code).catch((err) => {
    console.error(`✗ ${(err as Error).message}`);
    process.exit(1);
  });
} else {
  startLoopbackServer();
}

function startLoopbackServer(): void {
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
      await finish(code);
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(
        `<p style="font:16px system-ui;padding:2rem">Authorised. You can close this tab.</p>`,
      );
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
}
