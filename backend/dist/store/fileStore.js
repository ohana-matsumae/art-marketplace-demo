import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Configurable via env so Docker can mount a volume at a known path.
export const UPLOADS_ROOT = process.env.UPLOADS_DIR ?? path.resolve(__dirname, "../../../uploads");
export const PUBLIC_DIR = path.join(UPLOADS_ROOT, "public");
export const PRIVATE_DIR = path.join(UPLOADS_ROOT, "private");
const STORE_PATH = path.join(UPLOADS_ROOT, "store.json");
async function readStore() {
    try {
        const raw = await fs.readFile(STORE_PATH, "utf-8");
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
async function writeStore(store) {
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}
/** Create upload directories if they don't exist. Called at server startup. */
export async function ensureDirs() {
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    await fs.mkdir(PRIVATE_DIR, { recursive: true });
}
export async function saveEntry(entry) {
    const store = await readStore();
    store[entry.uploadToken] = entry;
    await writeStore(store);
}
export async function getEntry(token) {
    const store = await readStore();
    return store[token] ?? null;
}
/**
 * Bind an upload token to an on-chain listing ID.
 * Returns false if the token doesn't exist.
 */
export async function registerListing(token, listingId) {
    const store = await readStore();
    const entry = store[token];
    if (!entry)
        return false;
    entry.listingId = listingId;
    await writeStore(store);
    return true;
}
