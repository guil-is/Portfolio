import fs from "node:fs";
import path from "node:path";
import type { CaseFigureItem } from "@/components/CaseFigure";

// All images for this case study live in /public/projects/thrive-product/.
// Naming: section number first, then a slug — e.g. 04-missing-data-github.png.
const DIR = "projects/thrive-product";

// Read PNG dimensions from the IHDR chunk (bytes 16-23) so next/image
// gets the real aspect ratio without a dependency. Non-PNG files fall
// back to 16:9.
function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(12) !== 0x49484452) return null; // "IHDR"
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (!width || !height) return null;
  return { width, height };
}

/**
 * Resolve an expected image file at build time. If the file exists in
 * /public/projects/thrive-product/ the item renders as a real image;
 * otherwise CaseFigure shows a placeholder with the expected filename.
 * Drop the file in, redeploy, and it just works.
 */
export function img(file: string, alt: string): CaseFigureItem {
  const abs = path.join(process.cwd(), "public", DIR, file);
  try {
    const fd = fs.openSync(abs, "r");
    const buf = Buffer.alloc(24);
    fs.readSync(fd, buf, 0, 24, 0);
    fs.closeSync(fd);
    const size = file.toLowerCase().endsWith(".png") ? pngSize(buf) : null;
    return {
      file,
      alt,
      src: `/${DIR}/${file}`,
      width: size?.width ?? 1600,
      height: size?.height ?? 900,
    };
  } catch {
    return { file, alt };
  }
}
