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

export type GalleryMediaItem = {
  src: string;
  /** Intrinsic width / height. Falls back to 16:9 when unmeasurable. */
  aspect: number;
};

// Header-only dimension readers (no image dependency): PNG IHDR,
// JPEG SOF frame, GIF logical screen descriptor.
function pngSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || buf.readUInt32BE(12) !== 0x49484452) return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return width && height ? { width, height } : null;
}

function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
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

function gifSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 10 || buf.toString("ascii", 0, 3) !== "GIF") return null;
  const width = buf.readUInt16LE(6);
  const height = buf.readUInt16LE(8);
  return width && height ? { width, height } : null;
}

/** Measure a local /public asset's aspect ratio at build time.
 * Remote URLs and unsupported formats (video, webp, avif) fall back
 * to 16:9. */
export function getMediaAspect(publicSrc: string): number {
  if (/^https?:/i.test(publicSrc)) return 16 / 9;
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), "public", publicSrc));
    const lower = publicSrc.toLowerCase();
    const size = lower.endsWith(".png")
      ? pngSize(buf)
      : /\.jpe?g$/.test(lower)
        ? jpegSize(buf)
        : lower.endsWith(".gif")
          ? gifSize(buf)
          : null;
    return size ? size.width / size.height : 16 / 9;
  } catch {
    return 16 / 9;
  }
}

/** getGalleryImages plus a measured aspect ratio per file, so gallery
 * frames can match each image's intrinsic shape instead of cropping. */
export function getGalleryMedia(folder: string): GalleryMediaItem[] {
  return getGalleryImages(folder).map((src) => ({
    src,
    aspect: getMediaAspect(src),
  }));
}
