import fs from "node:fs";
import path from "node:path";

// Auto-discover image files in a /public/<folder> directory at build time.
// Returns sorted URL paths like ["/odyssey/clawbank/01-cover.jpg", ...].
// New images dropped into the folder show up on next build — no code edits.
export function getGalleryImages(folder: string): string[] {
  const dir = path.join(process.cwd(), "public", folder);
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter((f) => /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f))
      .sort()
      .map((f) => `/${folder}/${f}`);
  } catch {
    return [];
  }
}
