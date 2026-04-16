import fs from "node:fs";
import path from "node:path";

// Auto-discover image and video files in a /public/<folder> directory
// at build time. Returns sorted URL paths like
// ["/odyssey/clawbank/Clawbank-1.jpg", ...]. New files dropped into the
// folder show up on next build — no code edits.
export function getGalleryImages(folder: string): string[] {
  const dir = path.join(process.cwd(), "public", folder);
  try {
    const files = fs.readdirSync(dir);
    return files
      .filter((f) =>
        /\.(jpg|jpeg|png|webp|gif|avif|mp4|webm|mov)$/i.test(f),
      )
      .sort()
      .map((f) => `/${folder}/${f}`);
  } catch {
    return [];
  }
}
