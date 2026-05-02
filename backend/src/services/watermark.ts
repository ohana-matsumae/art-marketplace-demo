import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { PUBLIC_DIR, PRIVATE_DIR } from "../store/fileStore.js";

const WATERMARK_TEXT = "PREVIEW — NOT FOR DISTRIBUTION";
const PREVIEW_MAX_WIDTH = 900;
const PREVIEW_QUALITY = 65;

function buildWatermarkSvg(width: number, height: number): Buffer {
  const step = 220;
  const marks: string[] = [];
  for (let y = -height; y < height * 2; y += step) {
    for (let x = -width; x < width * 2; x += step) {
      marks.push(
        `<text x="${x}" y="${y}" transform="rotate(-35,${x},${y})"
          font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="bold"
          fill="rgba(255,255,255,0.22)" letter-spacing="2">${WATERMARK_TEXT}</text>`,
      );
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <filter id="sh">
        <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="rgba(0,0,0,0.45)"/>
      </filter>
    </defs>
    <g filter="url(#sh)">${marks.join("")}</g>
  </svg>`;
  return Buffer.from(svg);
}

export interface ProcessImageResult {
  publicFile: string;  // filename in PUBLIC_DIR  — watermarked preview JPEG
  privateFile: string; // filename in PRIVATE_DIR — original image
}

/**
 * Given a raw image buffer:
 *  1. Stores the original untouched in PRIVATE_DIR.
 *  2. Produces a resized, watermarked JPEG and stores it in PUBLIC_DIR.
 */
export async function processImage(
  buffer: Buffer,
  originalName: string,
): Promise<ProcessImageResult> {
  const token = uuidv4();
  const ext = path.extname(originalName) || ".jpg";
  const privateFile = `${token}-full${ext}`;
  const publicFile = `${token}-preview.jpg`;

  // 1. Store original as-is
  await fs.writeFile(path.join(PRIVATE_DIR, privateFile), buffer);

  // 2. Resize to preview dimensions
  const image = sharp(buffer);
  const meta = await image.metadata();
  const targetWidth = Math.min(meta.width ?? PREVIEW_MAX_WIDTH, PREVIEW_MAX_WIDTH);

  const previewBuf = await image
    .resize(targetWidth)
    .jpeg({ quality: PREVIEW_QUALITY })
    .toBuffer();

  const previewMeta = await sharp(previewBuf).metadata();
  const pw = previewMeta.width ?? targetWidth;
  const ph = previewMeta.height ?? 600;

  // 3. Composite watermark overlay
  await sharp(previewBuf)
    .composite([
      {
        input: buildWatermarkSvg(pw, ph),
        blend: "over",
        left: 0,
        top: 0,
      },
    ])
    .jpeg({ quality: PREVIEW_QUALITY })
    .toFile(path.join(PUBLIC_DIR, publicFile));

  return { publicFile, privateFile };
}

/**
 * Store an additional asset (PSD, ASE, ZIP, etc.) directly in PRIVATE_DIR
 * with a UUID-based filename to prevent enumeration.
 */
export async function storeAsset(
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  const ext = path.extname(originalName) || ".bin";
  const filename = `${uuidv4()}-asset${ext}`;
  await fs.writeFile(path.join(PRIVATE_DIR, filename), buffer);
  return filename;
}
