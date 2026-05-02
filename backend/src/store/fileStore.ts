import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurable via env so Docker can mount a volume at a known path.
export const UPLOADS_ROOT =
  process.env.UPLOADS_DIR ?? path.resolve(__dirname, "../../../uploads");
export const PUBLIC_DIR = path.join(UPLOADS_ROOT, "public");
export const PRIVATE_DIR = path.join(UPLOADS_ROOT, "private");

const STORE_PATH = path.join(UPLOADS_ROOT, "store.json");

export interface FileEntry {
  /** UUID that ties upload URIs to this record. */
  uploadToken: string;
  /** Lowercase hex address of the seller who uploaded. */
  sellerAddress: string;
  /** Filename (no path) of the watermarked preview — served from PUBLIC_DIR. */
  publicFile: string;
  /** Filename (no path) of the full-quality original — served from PRIVATE_DIR. */
  privateFile: string;
  /** Filenames (no path) of additional buyer-gated source files in PRIVATE_DIR. */
  assetFiles: string[];
  /** On-chain listing ID (decimal string) — set after the uploadArt tx confirms. */
  listingId?: string;
  createdAt: number;
}

type Store = Record<string, FileEntry>;

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

/** Create upload directories if they don't exist. Called at server startup. */
export async function ensureDirs(): Promise<void> {
  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.mkdir(PRIVATE_DIR, { recursive: true });
}

export async function saveEntry(entry: FileEntry): Promise<void> {
  const store = await readStore();
  store[entry.uploadToken] = entry;
  await writeStore(store);
}

export async function getEntry(token: string): Promise<FileEntry | null> {
  const store = await readStore();
  return store[token] ?? null;
}

/**
 * Look up a FileEntry by its on-chain listing ID (decimal string).
 * Returns null if no registered listing with that ID exists.
 */
export async function getEntryByListingId(
  listingId: string,
): Promise<FileEntry | null> {
  const store = await readStore();
  return (
    Object.values(store).find((e) => e.listingId === listingId) ?? null
  );
}

/**
 * Bind an upload token to an on-chain listing ID.
 * Returns false if the token doesn't exist.
 */
export async function registerListing(
  token: string,
  listingId: string,
): Promise<boolean> {
  const store = await readStore();
  const entry = store[token];
  if (!entry) return false;
  entry.listingId = listingId;
  await writeStore(store);
  return true;
}
