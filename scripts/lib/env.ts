import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Load KEY=VALUE lines from `.env.local` and `.env` into `process.env`.
 * Values already set (shell exports, CI secrets) win over the files.
 * `next dev` does this for the app, but `tsx` scripts don't get it for
 * free — call this at the top of any script that needs credentials.
 */
export function loadEnvFiles(root: string): void {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(root, name);
    if (!existsSync(path)) continue;
    for (const raw of readFileSync(path, "utf8").split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      const quoted =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"));
      if (quoted) value = value.slice(1, -1);
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}
