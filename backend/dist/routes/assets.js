import { Router } from "express";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/requireAuth.js";
import { getEntry, PRIVATE_DIR } from "../store/fileStore.js";
import { hasPurchased } from "../services/chain.js";
const router = Router();
// Tighter rate limit for gated downloads to limit scraping.
const downloadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests — slow down" },
});
/**
 * Safely stream a file from PRIVATE_DIR to the response.
 * Guards against path traversal by resolving the canonical path.
 */
async function servePrivateFile(res, filename, downloadAs) {
    const filePath = path.join(PRIVATE_DIR, filename);
    const resolved = path.resolve(filePath);
    // Prevent path traversal outside PRIVATE_DIR
    if (!resolved.startsWith(path.resolve(PRIVATE_DIR) + path.sep)) {
        res.status(400).json({ error: "Invalid file path" });
        return;
    }
    try {
        await fs.access(filePath);
    }
    catch {
        res.status(404).json({ error: "File not found" });
        return;
    }
    res.setHeader("Content-Disposition", `attachment; filename="${downloadAs ?? path.basename(filename)}"`);
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Pragma", "no-cache");
    createReadStream(filePath).pipe(res);
}
/**
 * Verify the session user is allowed to access files for `token`.
 * Returns the FileEntry and an `ok` flag; if ok is false, the response has
 * already been sent.
 */
async function checkAccess(req, res, token) {
    const entry = await getEntry(token);
    if (!entry) {
        res.status(404).json({ error: "Asset not found" });
        return { entry: null, ok: false };
    }
    if (!entry.listingId) {
        res.status(409).json({ error: "Asset is not yet linked to an on-chain listing" });
        return { entry, ok: false };
    }
    const buyer = req.session.walletAddress;
    // Sellers always have access to their own uploads
    if (buyer === entry.sellerAddress) {
        return { entry, ok: true };
    }
    const purchased = await hasPurchased(BigInt(entry.listingId), buyer);
    if (!purchased) {
        res.status(403).json({ error: "Purchase required to download this asset" });
        return { entry, ok: false };
    }
    return { entry, ok: true };
}
/**
 * GET /assets/:token/full
 * Stream the full-quality primary image to a verified buyer or the seller.
 */
router.get("/:token/full", requireAuth, downloadLimiter, async (req, res) => {
    const token = req.params["token"];
    const { entry, ok } = await checkAccess(req, res, token);
    if (!ok || !entry)
        return;
    await servePrivateFile(res, entry.privateFile);
});
/**
 * GET /assets/:token/extra/:index
 * Stream an additional source file (PSD, ASE, etc.) by its zero-based index.
 */
router.get("/:token/extra/:index", requireAuth, downloadLimiter, async (req, res) => {
    const token = req.params["token"];
    const index = req.params["index"];
    const idx = Number(index);
    if (!Number.isInteger(idx) || idx < 0) {
        res.status(400).json({ error: "index must be a non-negative integer" });
        return;
    }
    const { entry, ok } = await checkAccess(req, res, token);
    if (!ok || !entry)
        return;
    if (idx >= entry.assetFiles.length) {
        res.status(404).json({ error: `No asset at index ${idx}` });
        return;
    }
    await servePrivateFile(res, entry.assetFiles[idx]);
});
export default router;
