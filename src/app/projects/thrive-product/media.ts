import fs from "node:fs";
import path from "node:path";
import type { CaseFigureItem } from "@/components/CaseFigure";

// All images for this case study live in /public/projects/thrive-product/.
// Naming: section number first, then a slug — e.g. 04-missing-data-github.png.
const DIR = "projects/thrive-product";

// Read PNG dimensions from the IHDR chunk (bytes 16-23) so next/image
// gets the real aspect ratio without a dependency. Unparsable files
// fall back to 16:9.
function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(12) !== 0x49484452) return null; // "IHDR"
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (!width || !height) return null;
  return { width, height };
}

// Walk JPEG segment markers to the first SOF frame header, which
// carries the pixel dimensions.
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    // SOF0-SOF15 minus DHT (C4), JPG (C8), DAC (CC)
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: buf.readUInt16BE(i + 5),
        width: buf.readUInt16BE(i + 7),
      };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
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
    const buf = fs.readFileSync(abs);
    const lower = file.toLowerCase();
    const size = lower.endsWith(".png")
      ? pngSize(buf)
      : /\.jpe?g$/.test(lower)
        ? jpegSize(buf)
        : null;
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
